/* eslint @typescript-eslint/no-unused-vars: 0 */
import { ErrorResponse } from "@/interface/response.interface.js";
import type { ErrorRequestHandler } from "express";

export default (): ErrorRequestHandler => (err, _req, res, _next) => {
  const response: ErrorResponse = {
    name: "InternalServerError",
    message: "Internal Server Error",
    status: 500,
    error: {
      msg: "Internal Server Error",
    },
  };
  if (err instanceof Error) {
    response.error = {
      name: err.name,
      msg: err.message,
    };
  }
  if (err instanceof ErrorResponse) {
    return res.status(err.status).json(err);
  }
  return res.status(response.status).json(response);
};
