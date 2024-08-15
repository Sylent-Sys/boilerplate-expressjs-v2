import fileRoutingConfig from "@/config/file-routing.config.js";
import type {
  ExpressLike,
  Route,
  File,
  Options,
} from "@/interface/file-routing.interface.js";
import LocationUtil from "@/util/location.util.js";
import express, { Router, type Handler, type RouterOptions } from "express";
import { type ParsedPath } from "path";
export default class FileRoutingLib {
  locationUtil: LocationUtil;
  constructor() {
    this.locationUtil = new LocationUtil();
  }
  isFileIgnored(parsedFile: ParsedPath) {
    return (
      !fileRoutingConfig.VALID_FILE_EXTENSIONS.includes(
        parsedFile.ext.toLowerCase(),
      ) ||
      fileRoutingConfig.INVALID_NAME_SUFFIXES.some((suffix) =>
        parsedFile.base.toLowerCase().endsWith(suffix),
      ) ||
      parsedFile.name.startsWith(fileRoutingConfig.IGNORE_PREFIX_CHAR) ||
      parsedFile.dir.startsWith(`/${fileRoutingConfig.IGNORE_PREFIX_CHAR}`)
    );
  }
  isHandler(handler: unknown): handler is Handler | Handler[] {
    return typeof handler === "function" || Array.isArray(handler);
  }
  prioritizeRoutes(routes: Route[]) {
    return routes.sort((a, b) => a.priority - b.priority);
  }
  mergePaths(...paths: string[]) {
    return (
      "/" +
      paths
        .map((path) => path.replace(/^\/|\/$/g, ""))
        .filter((path) => path !== "")
        .join("/")
    );
  }

  convertParamSyntax(path: string) {
    const regBackets = /\[([^}]*)\]/g;
    const transformBrackets = (value: string) =>
      regBackets.test(value)
        ? value.replace(regBackets, (_, s) => `:${s}`)
        : value;
    const subpaths: string[] = [];
    for (const subpath of path.split("/")) {
      subpaths.push(transformBrackets(subpath));
    }
    return this.mergePaths(...subpaths);
  }

  convertCatchallSyntax(url: string) {
    return url.replace(/:\.\.\.\w+/g, "*");
  }

  buildRoutePath(parsedFile: ParsedPath) {
    const directory = parsedFile.dir === parsedFile.root ? "" : parsedFile.dir;
    const name = parsedFile.name.startsWith("index")
      ? parsedFile.name.replace("index", "")
      : `/${parsedFile.name}`;
    return directory + name;
  }

  buildRouteUrl(path: string) {
    const url = this.convertParamSyntax(path);
    return this.convertCatchallSyntax(url);
  }

  calculatePriority(url: string) {
    const depth = url.match(/\/.+?/g)?.length || 0;
    const specifity = url.match(/\/:.+?/g)?.length || 0;
    const catchall = (url.match(/\/\*/g)?.length ?? 0 > 0) ? Infinity : 0;
    return depth + specifity + catchall;
  }

  getHandlers(handler: Handler | Handler[]): Handler[] {
    if (!Array.isArray(handler)) return [handler];
    return handler;
  }
  getApplication(handler: Handler | Handler[]) {
    const app = express();
    app.all("/", ...this.getHandlers(handler));
    return app;
  }
  getMethodKey(method: string) {
    const methodKey = method.toLowerCase();
    if (methodKey === "del") return "delete";
    return methodKey;
  }
  walkTree(directory: string, tree: string[] = []) {
    const results: File[] = [];
    for (const fileName of this.locationUtil.fs.readdirSync(directory)) {
      const filePath = this.locationUtil.path.join(directory, fileName);
      const fileStats = this.locationUtil.fs.statSync(filePath);
      if (fileStats.isDirectory()) {
        results.push(...this.walkTree(filePath, [...tree, fileName]));
      } else {
        results.push({
          name: fileName,
          path: directory,
          rel: this.mergePaths(...tree, fileName),
        });
      }
    }
    return results;
  }
  async generateRoutes(files: File[]) {
    const routes: Route[] = [];
    for (const file of files) {
      const parsedFile = this.locationUtil.path.parse(file.rel);
      if (this.isFileIgnored(parsedFile)) continue;
      const routePath = this.buildRoutePath(parsedFile);
      const url = this.buildRouteUrl(routePath);
      const priority = this.calculatePriority(url);
      const exports = await import(
        "file://" + this.locationUtil.path.join(file.path, file.name)
      );
      routes.push({
        url,
        priority,
        exports,
      });
    }
    return this.prioritizeRoutes(routes);
  }
  async loadRoutesAsMiddleware(
    options: Options & { routerOptions?: RouterOptions } = {},
  ) {
    const routerOptions = options?.routerOptions || {};
    return await this.loadRoutes(Router(routerOptions), options);
  }
  async loadRoutes<T extends ExpressLike = ExpressLike>(
    app: T,
    options: Options = {},
  ) {
    const files = this.walkTree(
      options.directory ||
        this.locationUtil.getFolderPath({ folderName: "routes" }),
    );
    const routes = await this.generateRoutes(files);
    for (const { url, exports } of routes) {
      const exportedMethods = Object.entries(exports);
      for (const [method, handler] of exportedMethods) {
        const methodKey = this.getMethodKey(method);
        if (handler !== undefined) {
          const handlers = this.getHandlers(handler);
          if (
            !options.additionalMethods?.includes(methodKey) &&
            !fileRoutingConfig.DEFAULT_METHOD_EXPORTS.includes(methodKey)
          )
            continue;
          app[methodKey](url, ...handlers);
        }
      }
      if (typeof exports.default !== "undefined") {
        if (this.isHandler(exports.default())) {
          app.all.apply(app, [url, this.getApplication(exports.default())]);
        } else if (this.isHandler(exports.default)) {
          app.all.apply(app, [url, this.getApplication(exports.default)]);
        } else if (
          typeof exports.default === "object" &&
          this.isHandler(exports.default.default)
        ) {
          app.all.apply(app, [
            url,
            this.getApplication(exports.default.default),
          ]);
        }
      }
    }
    return app;
  }
}
