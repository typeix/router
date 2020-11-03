import {HttpMethod} from "../methods";

/**
 * @since 1.0.0
 * @interface
 * @name IResolvedRoute
 *
 * @description
 * If we match route we resolve it with this interface
 */

/**
 * Resolved route
 */
export interface IResolvedRoute {
  method: HttpMethod;
  params: Object;
  route: string;
}

/**
 * @since 1.0.0
 * @interface
 * @name Route
 *
 * @description
 * Route definition
 */
export interface Route {
  parseRequest(pathName: string, method: HttpMethod, headers: { [key: string]: any }): Promise<IResolvedRoute>;

  createUrl(routeName: string, params: Object): Promise<string>;
}

/**
 * @since 1.0.0
 * @type
 * @name TRoute
 *
 * @description
 * TRoute declaration for type constructor
 */
export declare type TRoute = {
  new(): Route;
};

/**
 * @since 1.0.0
 * @interface
 * @name RouteRuleConfig
 *
 * @description
 * Route rule definition
 */
export interface RouteRuleConfig {
  url: string;
  route: string;
  methods: Array<HttpMethod>;
}

