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
  LOG: z.custom<boolean>((value) => {
    if (value === "true" || value === "false") {
      return { success: true, data: value === "true" };
    }
    return {
      success: false,
      message: "LOG must be a boolean 'true' or 'false'",
    };
  }),
});
export type env = z.infer<typeof envSchema>;
