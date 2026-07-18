import { createAuthClient } from "better-auth/react";


const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
console.log(API_URL, "baseurl");

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
