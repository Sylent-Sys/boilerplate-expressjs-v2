import type { Request, Response, NextFunction } from "express";
export default class ExpressUtil {
  req: Request;
  res: Response;
  next: NextFunction;
  constructor(req: Request, res: Response, next: NextFunction) {
    this.req = req;
    this.res = res;
    this.next = next;
  }
}
