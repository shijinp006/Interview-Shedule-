import { fromZonedTime } from "date-fns-tz";
import { connectDb, getMongoClient, disconnectDb } from "./db";
import { createAuth } from "./auth";
import { Interviewer } from "./models/Interviewer";
import { Candidate } from "./models/Candidate";
import { Interview } from "./models/Interview";
import { logger } from "./logger";

const RECRUITER = {
  email: "recruiter@micro-ats.test",
  password: "password123",
  name: "Riley Recruiter",
};

/** yyyy-MM-dd of the next Monday strictly after today (always a weekday, future). */
function nextMondayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  const add = ((1 - d.getUTCDay() + 7) % 7) || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

async function main() {
  await connectDb();
  const auth = createAuth(getMongoClient());

  try {
    await auth.api.signUpEmail({ body: RECRUITER });
    logger.info(`Seeded recruiter: ${RECRUITER.email} / ${RECRUITER.password}`);
  } catch {
    logger.info(`Recruiter already exists: ${RECRUITER.email}`);
  }

  await Promise.all([
    Interview.deleteMany({}),
    Interviewer.deleteMany({}),
    Candidate.deleteMany({}),
  ]);

  const workweek = [1, 2, 3, 4, 5];
  const [alice, bob] = await Interviewer.create([
    {
      name: "Alice Zhang",
      email: "alice@corp.test",
      timeZone: "America/New_York",
      workingDays: workweek,
      workStart: "09:00",
      workEnd: "17:00",
    },
    {
      name: "Bob Smith",
      email: "bob@corp.test",
      timeZone: "Europe/London",
      workingDays: workweek,
      workStart: "09:00",
      workEnd: "17:00",
    },
    {
      name: "Chen Wei",
      email: "chen@corp.test",
      timeZone: "Asia/Kolkata",
      workingDays: workweek,
      workStart: "10:00",
      workEnd: "18:00",
    },
  ]);

  const candidates = await Candidate.create([
    { name: "Dana Lee", stage: "Applied" },
    { name: "Evan Ross", stage: "Technical Round" },
    { name: "Farah Khan", stage: "Offered" },
    { name: "Grace Kim", stage: "Hired" },
    { name: "Hugo Diaz", stage: "Rejected" },
    { name: "Ivy Chen", stage: "Technical Round" },
  ]);

  const monday = nextMondayISO();
  const utc = (tz: string, hhmm: string) => fromZonedTime(`${monday}T${hhmm}:00`, tz);

  await Interview.create([
    // Alice (NY): 10:00–11:00, then an adjacent 11:00–12:00 (adjacency is allowed).
    {
      interviewer: alice!._id,
      candidate: candidates[1]!._id,
      start: utc("America/New_York", "10:00"),
      end: utc("America/New_York", "11:00"),
      status: "Scheduled",
    },
    {
      interviewer: alice!._id,
      candidate: candidates[5]!._id,
      start: utc("America/New_York", "11:00"),
      end: utc("America/New_York", "12:00"),
      status: "Scheduled",
    },
    // Bob (London): 14:00–15:00.
    {
      interviewer: bob!._id,
      candidate: candidates[2]!._id,
      start: utc("Europe/London", "14:00"),
      end: utc("Europe/London", "15:00"),
      status: "Scheduled",
    },
  ]);

  logger.info(
    `Seed complete. Next Monday = ${monday}. Try booking Alice Zhang 10:30–11:30 (NY) to trigger a 409 conflict.`,
  );
  await disconnectDb();
  process.exit(0);
}

main().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
