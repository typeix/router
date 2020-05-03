import {StatusCodes} from "./status-codes";
import {isTruthy, inspect} from "@typeix/utils";
import {IResolvedRoute} from "./interfaces";

/**
 * @since 2.4.0
 * @class
 * @name ServerError
 * @param {Number} code status code
 * @param {String} message
 * @param {Object} data
 * @constructor
 */
export class ServerError extends Error {
  static merge(error: Error) {
    if (!(error instanceof ServerError)) {
      let _error: Error = error;
      error = new ServerError(StatusCodes.Internal_Server_Error, _error.message, {});
      error.stack = _error.stack;
    }
    return error;
  }

  constructor(private code: StatusCodes | number, message?: string, data?: Object, public route?: IResolvedRoute) {
    super(message);
    if (isTruthy(data)) {
      this.stack += "\n\nDATA: " + inspect(data, 5);
    }
    this.stack += "\n\nCODE: " + inspect(code, 5);
    if (isTruthy(route)) {
      this.stack += "\n\nROUTE: " + inspect(route, 5);
    }
  }

  getMessage() {
    return this.message;
  }

  getCode(): StatusCodes {
    return this.code;
  }

  toString() {
    return this.stack;
  }
}
