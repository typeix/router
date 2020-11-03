import {IAfterConstruct, Inject, Injectable} from "@typeix/di";
import {RouteParser} from "./parser";
import {HttpMethod} from "./methods";
import {isFalsy} from "@typeix/utils";
import {IResolvedRoute, Route, RouteRuleConfig} from "./interfaces";


/**
 * @since 1.0.0
 * @function
 * @name RouteRule
 * @constructor
 *
 * @param {RouteRuleConfig} config
 *
 * @description
 * Route rule provider is used by router to parse request and create route url
 */
@Injectable()
export class RouteRule implements Route, IAfterConstruct {

  @Inject("config")
  private config: RouteRuleConfig;
  private routeParser: RouteParser;

  /**
   * @since 1.0.0
   * @function
   * @name RouteRule#afterConstruct
   * @private
   *
   * @description
   * After construct apply config data
   */
  afterConstruct(): void {
    this.routeParser = new RouteParser(this.config.url);
  }
  /**
   * @since 1.0.0
   * @function
   * @name RouteRule#parseRequest
   * @param {String} path
   * @param {String} method
   * @param {Object} headers
   * @private
   *
   * @return {Promise<IResolvedRoute>}
   * @static
   *
   * @description
   * Parse request is used internally by Router to be able to parse request
   */
  parseRequest(path: string, method: HttpMethod, headers: { [key: string]: any }): Promise<IResolvedRoute> {
    if (!this.routeParser.isValid(path) || this.config.methods.indexOf(method) === -1) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      method: method,
      params: this.routeParser.getParams(path),
      route: this.config.route
    });
  }

  /**
   * @since 1.0.0
   * @function
   * @name RouteRule#parseRequest
   * @param {String} routeName
   * @param {Object} params
   * @private
   *
   * @return {Promise<string|boolean>}
   * @static
   *
   * @description
   * It try's to create url
   */
  createUrl(routeName: string, params: Object): Promise<string> {
    if (this.config.route === routeName) {
      let url = this.routeParser.createUrl(params);
      if (isFalsy(url)) {
        url = this.config.url;
      }
      return Promise.resolve(url);
    }
    return Promise.resolve(null);
  }
}
