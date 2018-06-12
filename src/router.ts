import {isDefined, isEqual, isObject, isString, isTruthy, Logger, ServerError} from "@typeix/utils";
import {Inject, Injectable, Injector} from "@typeix/di";
import {IResolvedRoute, Route, RouteRuleConfig, TRoute} from "./interfaces/iroute";
import {RouteRule} from "./route-rule";
import {StatusCodes} from "@typeix/utils";

/**
 * @since 1.0.0
 * @class
 * @name Router
 * @constructor
 * @description
 * Router is a component for handling routing in system.
 * All routes should be added during bootstrap process
 */

@Injectable()
export class Router {

  /**
   * @param {Injector} injector
   */
  @Inject(Logger)
  private logger: Logger;
  /**
   * @param {Injector} injector
   */
  @Inject(Injector)
  private injector: Injector;
  /**
   * @param {Array<Route>} routes
   */
  private routes: Array<Route> = [];
  /**
   * ErrorMessage route definition
   * @param {String} errorRoute
   */
  private errorRoutes: Array<string> = [];

  /**
   * @since 1.0.0
   * @function
   * @name Router#prefixSlash
   * @param {string} value
   * @static
   * @private
   *
   * @description
   * Prefixes url with starting slash
   */
  static prefixSlash(value: string): string {
    if (value === "*") {
      return "/";
    }
    return value.charAt(0) === "/" ? value : "/" + value;
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#getError
   *
   * @description
   * Returns error route string
   */
  getError(module?: string): string {
    let routes = this.errorRoutes.slice();
    let item: string;
    while (routes.length > 0) {
      item = routes.pop();
      if (item.startsWith(module + "/")) {
        return item;
      }
    }
    return item;
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#hasErrorRoute
   *
   * @description
   * Check if error route is provided
   */
  hasError(): boolean {
    return isTruthy(this.errorRoutes.length > 0);
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#setError
   * @param {string} route
   *
   * @description
   * Add error route
   */
  setError(route: string): void {
    if (this.errorRoutes.indexOf(route) === -1 && isString(route)) {
      let list = route.split("/");
      if (list.length < 2) {
        throw new ServerError(
          StatusCodes.Internal_Server_Error,
          `Invalid route structure: "${route}"! Valid are controller/action or module/controller/action!`,
          route
        );
      }
      this.errorRoutes.push(route);
    }
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#addRules
   * @param {Array<RouteRuleConfig>} rules
   *
   * @description
   * Add route to routes list.
   * All routes must be inherited from Route interface.
   */
  addRules(rules: Array<RouteRuleConfig>): void {
    this.logger.info("Router.addRules", rules);
    rules.forEach(config => this.routes.push(this.createRule(RouteRule, config)));
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#addRule
   * @param {Function} Class
   * @param {RouteRuleConfig} config
   *
   * @description
   * Create rule and add rule to list
   */
  addRule(Class: TRoute, config?: RouteRuleConfig): void {
    this.logger.info("Router.addRule", Class);
    this.routes.push(this.createRule(Class, config));
  }


  /**
   * @since 1.0.0
   * @function
   * @name Router#parseRequest
   * @param {String} pathName
   * @param {String} method
   * @param {Headers} headers
   *
   * @description
   * Parse request based on pathName and method
   */
  async parseRequest(pathName: string, method: string, headers: { [key: string]: any }): Promise<IResolvedRoute> {
    for (let route of this.routes) {
      let result: IResolvedRoute = <IResolvedRoute> await route.parseRequest(pathName, method, headers);
      if (isTruthy(result) && isObject(result)) {
        this.logger.info("Router.parseRequest", result);
        return result;
      }
    }
    throw new ServerError(
      StatusCodes.Not_Found,
      `Router.parseRequest: ${pathName} no route found, method: ${method}`,
      {
        pathName,
        method
      }
    );
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#createUrl
   * @param {String} routeName
   * @param {Object} params
   *
   * @description
   * Create url based on route and params
   */
  async createUrl(routeName: string, params: Object): Promise<string> {
    for (let route of this.routes) {
      let result = await <Promise<string>> route.createUrl(routeName, params);
      if (isTruthy(result) && !isEqual(true, result)) {
        this.logger.info("Router.createUrl", result);
        return Promise.resolve(Router.prefixSlash(result));
      }
    }
    if (Object.keys(params).length > 0) {
      routeName += "?";
      Object.keys(params).forEach((k) => {
        routeName += k + "=" + encodeURIComponent(params[k]);
      });
    }
    this.logger.info("Router.createUrl", Router.prefixSlash(routeName));
    return Promise.resolve(Router.prefixSlash(routeName));
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#createRule
   * @param {Function} Class
   * @param {RouteRuleConfig} config
   *
   * @description
   * Initialize rule
   */
  private createRule(Class: TRoute, config?: RouteRuleConfig): Route {
    let injector = Injector.createAndResolveChild(
      this.injector,
      Class,
      isDefined(config) ? [{provide: "config", useValue: config}] : []
    );
    return injector.get(Class);
  }

}
