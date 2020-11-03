/**
 * Router Error
 */
export class RouterError extends Error {

  readonly code: number;
  readonly data: any;

  constructor(code: number, message: string, data: any) {
    super(message);
    this.code = code;
    this.data = data;
  }

  getMessage() {
    return this.message;
  }

  getData() {
    return this.data;
  }

  getCode() {
    return this.code;
  }

}
