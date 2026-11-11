import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV:z.enum(["development","production","test"]).default("development"),
  PORT:z.coerce.number().int().positive().default(3000),
  DATABASE_HOST:z.string().min(1), DATABASE_PORT:z.coerce.number().int().positive().default(5432),
  DATABASE_NAME:z.string().min(1), DATABASE_USER:z.string().min(1),
  DATABASE_PASSWORD:z.string().default(""), DATABASE_MAX_CONNECTIONS:z.coerce.number().int().positive().default(10),
  DATABASE_URL:z.string().default(""), JWT_SECRET:z.string().default(""), JWT_EXPIRES_IN:z.string().default(""),
  GOOGLE_CLIENT_ID:z.string().default(""), FACEBOOK_APP_ID:z.string().default(""),
  FACEBOOK_APP_SECRET:z.string().default(""), FACEBOOK_GRAPH_API_VERSION:z.string().default("v26.0"),
  APPLE_TEAM_ID:z.string().default(""), APPLE_CLIENT_ID:z.string().default(""),
  APPLE_KEY_ID:z.string().default(""), APPLE_PRIVATE_KEY:z.string().default(""), APPLE_REDIRECT_URI:z.string().default(""),
  TELEGRAM_GATEWAY_TOKEN:z.string().default(""),
});
export const env=envSchema.parse(process.env);
