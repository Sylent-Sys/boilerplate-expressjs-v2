import type { SuccessResponse } from "@/interface/response.interface.js";

export default class IndexService {
  async index(): Promise<SuccessResponse> {
    return {
      message: "Success",
      status: 200,
      data: {
        msg: "Template By Sylent-Sys",
      },
    };
  }
}
