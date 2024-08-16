import express, { Express, type Handler } from "express";
import cors from "cors";
import FileRoutingLib from "@/lib/file-routing.lib.js";
import errorMiddleware from "@/middleware/error.middleware.js";
import { ErrorResponse } from "@/interface/response.interface.js";
import EnvUtil from "@/util/env.util.js";
import winston, { format, Logger } from "winston";
export default class AppLib {
  private express: Express;
  private envUtil: EnvUtil;
  constructor({
    middleware = [],
    corsOptions = {},
    allowedOrigins = [],
    allowedApiPaths = [],
  }: {
    middleware?: Handler[];
    corsOptions?: cors.CorsOptions;
    allowedOrigins?: string[];
    allowedApiPaths?: string[];
  } = {}) {
    this.express = express();
    this.envUtil = new EnvUtil();
    this.initLogger();
    this.initCors(corsOptions, allowedOrigins, allowedApiPaths);
    this.initMiddleware([express.json(), ...middleware]);
  }
  private initLogger() {
    const isLog: boolean = this.envUtil.getEnv("LOG") as boolean;
    if (isLog) {
      const { combine, timestamp, printf, colorize, align } = format;
      const logger: Logger = winston.createLogger({
        level: process.env.LOG_LEVEL || "info",
        format: combine(
          colorize({ all: true }),
          timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
          }),
          align(),
          printf(
            (info) => `[${info.timestamp}] ${info.level}: ${info.message}`,
          ),
        ),
        transports: [new winston.transports.Console()],
      });
      this.express.use((req, _res, next) => {
        logger.info(
          `Received request: ${req.method} ${req.url} ${req.headers["x-forwarded-for"] || req.socket.remoteAddress}`,
        );
        next();
      });
    }
  }
  private initCors(
    corsOptions: cors.CorsOptions,
    allowedOriginsOptions: string[] = [],
    allowedApiPathsOptions: string[] = [],
  ) {
    const frontendOrigin: string | undefined = this.envUtil.getEnv(
      "FRONTEND_URL",
    ) as string | undefined;
    const domain: string | undefined = this.envUtil.getEnv("BACKEND_URL") as
      | string
      | undefined;
    const allowedOrigins: string[] = [
      frontendOrigin || "",
      domain || "",
      ...allowedOriginsOptions,
    ];
    const allowedApiPaths: string[] = [...allowedApiPathsOptions];
    const options: cors.CorsOptions = {
      origin: function (origin, callback) {
        if (origin != undefined && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(
            new ErrorResponse("CORS", 403, "Not allowed by CORS", {
              msg: "Not allowed by CORS",
            }),
          );
        }
      },
      methods: "GET,PUT,POST,DELETE",
      allowedHeaders: "Content-Type,Authorization",
      ...corsOptions,
    };
    this.express.use((req, res, next) => {
      const isAllowedApiPath: boolean =
        allowedApiPaths.find((path) => req.path.startsWith(path)) != undefined
          ? true
          : false;
      if (isAllowedApiPath) {
        next();
      } else {
        cors(
          this.envUtil.getEnv("NODE_ENV") === "development"
            ? undefined
            : options,
        )(req, res, next);
      }
    });
  }
  private initMiddleware(middleware: Handler[] = []) {
    if (middleware.length === 0) return;
    middleware.forEach((middleware) => {
      this.express.use(middleware);
    });
  }
  async run(port: number) {
    this.express.use("/", await new FileRoutingLib().loadRoutesAsMiddleware());
    this.express.use(errorMiddleware());
    this.express.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
