import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
  database: {
    dialect: new LibsqlDialect({
      url: "file:./auth.db"
    }),
    type: "sqlite"
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24
  },
  user: {
    additionalFields: {
      plan: {
        type: "string" as const,
        defaultValue: "free",
        required: false
      }
    }
  }
});
