/* eslint @typescript-eslint/no-explicit-any: 0 */
import type { Express, Handler, Router } from "express";

interface ExpressExtended extends Express, Record<string, any> {}
interface RouterExtended extends Router, Record<string, any> {}
export type ExpressLike = ExpressExtended | RouterExtended;

export interface Options {
  directory?: string;
  additionalMethods?: string[];
}

export interface File {
  name: string;
  path: string;
  rel: string;
}

type MethodExport = Handler | Handler[];

interface MethodExports {
  get?: MethodExport;
  post?: MethodExport;
  put?: MethodExport;
  patch?: MethodExport;
  delete?: MethodExport;
  head?: MethodExport;
  connect?: MethodExport;
  options?: MethodExport;
  trace?: MethodExport;

  [x: string]: MethodExport | undefined;
}

type Exports = MethodExports & {
  default?: any;
};

export interface Route {
  url: string;
  priority: number;
  exports: Exports;
}
