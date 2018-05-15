import {isEqual} from "@typeix/utils";
/**
 * @since 1.0.0
 * @enum
 * @name RestMethods
 *
 * @description
 * ControllerResolver methods
 */

export enum RestMethods {
  GET,
  HEAD,
  DELETE,
  TRACE,
  OPTIONS,
  CONNECT,
  POST,
  PUT,
  PATCH
}

/**
 * @since 1.0.0
 * @function
 * @name fromRestMethod
 * @param {string} method
 *
 * @description
 * Get method name from RestMethods enum
 */
export function fromRestMethod(method: RestMethods): string {
  if (isEqual(RestMethods.GET, method)) {
    return "GET";
  } else if (isEqual(RestMethods.HEAD, method)) {
    return "HEAD";
  } else if (isEqual(RestMethods.DELETE, method)) {
    return "DELETE";
  } else if (isEqual(RestMethods.TRACE, method)) {
    return "TRACE";
  } else if (isEqual(RestMethods.OPTIONS, method)) {
    return "OPTIONS";
  } else if (isEqual(RestMethods.CONNECT, method)) {
    return "CONNECT";
  } else if (isEqual(RestMethods.POST, method)) {
    return "POST";
  } else if (isEqual(RestMethods.PUT, method)) {
    return "PUT";
  } else if (isEqual(RestMethods.PATCH, method)) {
    return "PATCH";
  }
}
/**
 * @since 1.0.0
 * @function
 * @name toRestMethod
 * @param {string} method
 *
 * @description
 * Get method enum from method string
 * @throws TypeError
 */
export function toRestMethod(method: string): RestMethods {
  if (method === "GET") {
    return RestMethods.GET;
  } else if (method === "HEAD") {
    return RestMethods.HEAD;
  } else if (method === "DELETE") {
    return RestMethods.DELETE;
  } else if (method === "TRACE") {
    return RestMethods.TRACE;
  } else if (method === "OPTIONS") {
    return RestMethods.OPTIONS;
  } else if (method === "CONNECT") {
    return RestMethods.CONNECT;
  } else if (method === "POST") {
    return RestMethods.POST;
  } else if (method === "PUT") {
    return RestMethods.PUT;
  } else if (method === "PATCH") {
    return RestMethods.PATCH;
  }
  throw new TypeError(`Method ${method} is not known method by standard!`);
}
