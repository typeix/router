/**
 * @since 1.0.0
 * @enum
 * @name HttpMethod
 *
 * @description
 * ControllerResolver methods
 */

export enum HttpMethod {
  GET = "GET",
  HEAD = "HEAD",
  DELETE = "DELETE",
  TRACE = "TRACE",
  OPTIONS = "OPTIONS",
  CONNECT = "CONNECT",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH"
}

/**
 * Convert to http method
 * @param value
 */
export function toHttpMethod(value: string): HttpMethod {
  return HttpMethod[value];
}
