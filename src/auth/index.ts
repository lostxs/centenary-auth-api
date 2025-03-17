import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: process.env.ORIGINS.split(","),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [openAPI()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          partitioned: true, // New browser standards will mandate this for foreign cookies
        },
      },
    },
  },
} satisfies BetterAuthOptions);
