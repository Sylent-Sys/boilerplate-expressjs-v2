import "dotenv/config";
import AppLib from "@/lib/app.lib.js";
import EnvUtil from "@/util/env.util.js";

new AppLib().run(new EnvUtil().getEnv("APP_PORT") as number);
