import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database.ts";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  appName: 'backend',
  plugins: [],
  emailAndPassword: {
    enabled: true,
  },
});
