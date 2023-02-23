export abstract class ResponseError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ResponseError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}
