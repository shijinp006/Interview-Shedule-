import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { windowsOverlap, validateWindow, withinWorkingHours } from "./overlap";

describe("windowsOverlap", () => {
  const t = (iso: string) => new Date(iso);

  it("detects overlapping windows", () => {
    assert.equal(
      windowsOverlap(
        t("2026-01-01T10:00:00Z"),
        t("2026-01-01T11:00:00Z"),
        t("2026-01-01T10:30:00Z"),
        t("2026-01-01T11:30:00Z"),
      ),
      true,
    );
  });

  it("treats back-to-back windows as non-overlapping (half-open)", () => {
    assert.equal(
      windowsOverlap(
        t("2026-01-01T10:00:00Z"),
        t("2026-01-01T11:00:00Z"),
        t("2026-01-01T11:00:00Z"),
        t("2026-01-01T12:00:00Z"),
      ),
      false,
    );
  });

  it("returns false for disjoint windows", () => {
    assert.equal(
      windowsOverlap(
        t("2026-01-01T10:00:00Z"),
        t("2026-01-01T11:00:00Z"),
        t("2026-01-01T12:00:00Z"),
        t("2026-01-01T13:00:00Z"),
      ),
      false,
    );
  });
});

describe("validateWindow", () => {
  const now = new Date("2026-01-01T09:00:00Z");

  it("rejects start >= end", () => {
    const r = validateWindow(
      new Date("2026-01-01T11:00:00Z"),
      new Date("2026-01-01T10:00:00Z"),
      { minMinutes: 15, maxMinutes: 180, now },
    );
    assert.equal(r.ok, false);
  });

  it("rejects past starts", () => {
    const r = validateWindow(
      new Date("2026-01-01T08:00:00Z"),
      new Date("2026-01-01T09:00:00Z"),
      { minMinutes: 15, maxMinutes: 180, now },
    );
    assert.equal(r.ok, false);
  });
});

describe("withinWorkingHours", () => {
  const wh = {
    timeZone: "UTC",
    workingDays: [1], // Monday
    workStart: "09:00",
    workEnd: "17:00",
  };

  it("accepts a window inside hours on a working day", () => {
    // 2026-01-05 is a Monday
    const r = withinWorkingHours(
      new Date("2026-01-05T10:00:00Z"),
      new Date("2026-01-05T11:00:00Z"),
      wh,
    );
    assert.equal(r.ok, true);
  });

  it("rejects a weekend day", () => {
    const r = withinWorkingHours(
      new Date("2026-01-04T10:00:00Z"), // Sunday
      new Date("2026-01-04T11:00:00Z"),
      wh,
    );
    assert.equal(r.ok, false);
  });
});
