/* eslint @typescript-eslint/no-explicit-any: 0 */
import type { Response, Request, NextFunction } from "express";
export default function Controller<T extends new (...args: any[]) => object>(
  constructor: T,
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      const methods = Object.getOwnPropertyNames(constructor.prototype);
      methods.forEach((method) => {
        const originalMethod = (this as any)[method] as (
          req: Request,
          res: Response,
          next: NextFunction,
        ) => Promise<void>;
        (this as any)[method] = async (
          req: Request,
          res: Response,
          next: NextFunction,
        ) => {
          try {
            await originalMethod.apply(this, [req, res, next]);
          } catch (error) {
            next(error);
          }
        };
      });
    }
  };
}
