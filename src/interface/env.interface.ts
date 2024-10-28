import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  APP_PORT: z.custom<number>((value) => {
    if (isNaN(Number(value))) {
      return { success: false, message: "APP_PORT must be a number" };
    }
    return { success: true, data: value };
  }),
  FRONTEND_URL: z.string(),
  BACKEND_URL: z.string(),
  LOG: z.custom<"TRUE" | "FALSE">((value) => {
    value = value.toLowerCase();
    if (value === "true" || value === "false") return true;
    return false;
  }),
});
export type env = z.infer<typeof envSchema>;
