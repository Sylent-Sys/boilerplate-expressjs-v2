import { env, envSchema } from "@/interface/env.interface.js";
export default class EnvUtil {
  envIsValid = false;
  env: env | undefined;
  constructor() {
    this.env = this.checkValidity();
  }
  private checkValidity() {
    const validatedEnv = envSchema.safeParse(process.env);
    if (!validatedEnv.success) {
      console.error(validatedEnv.error.errors);
      return;
    }
    this.envIsValid = true;
    return validatedEnv.data;
  }
  getEnv(key: keyof env) {
    if (!this.envIsValid) {
      throw new Error("Environment variables are not valid");
    }
    if (!this.env) {
      throw new Error("Environment variables are not set");
    }
    return this.env[key];
  }
}
