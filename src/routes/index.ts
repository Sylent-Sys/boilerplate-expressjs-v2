import IndexController from "@/controller/index.controller.js";
import { Handler } from "express";

export const get: Handler[] = [new IndexController().index];
