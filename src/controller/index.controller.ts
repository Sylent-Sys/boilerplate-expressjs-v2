import Controller from "@/decorator/controller.decorator.js";
import type { Response, Request } from "express";
import { SuccessResponse } from "@/interface/response.interface.js";
import IndexService from "@/service/index.service.js";
@Controller
export default class IndexController {
  service: IndexService;
  constructor() {
    this.service = new IndexService();
  }
  async index(_req: Request, res: Response): Promise<void> {
    const response: SuccessResponse = await this.service.index();
    res.status(response.status).json(response);
  }
}
