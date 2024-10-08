export class ErrorResponse extends Error {
  status: number;
  error: object[] | object;
  constructor(
    name: string,
    status: number,
    message: string,
    error: object[] | object,
  ) {
    super();
    this.name = name;
    this.status = status;
    this.message = message;
    this.error = error;
  }
}

export class SuccessResponse {
  status: number;
  message: string;
  data: object;
  constructor(status: number, message: string, data: object) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
