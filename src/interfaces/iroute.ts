import {RestMethods} from "../headers";
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
  method: RestMethods;
  params: Object;
  route: string;
}
/**
 * @since 1.0.0
 * @interface
 * @name IUrlTreePath
 *
 * @param {IUrlTreePath} child
 * @param {string} path
 *
 * @description
 * Metadata for RouteParser
 */
export interface IUrlTreePath {
  child?: IUrlTreePath;
  path: string;
}
/**
 * @since 1.0.0
 * @interface
 * @name Headers
 *
 */
export interface Headers {}
/**
 * @since 1.0.0
 * @interface
 * @name Route
 *
 * @description
 * Route definition
 */
export interface Route {
  parseRequest(pathName: string, method: string, headers: Headers): Promise<IResolvedRoute|boolean>;
  createUrl(routeName: string, params: Object): Promise<string|boolean>;
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
  new (): Route;
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
  methods: Array<RestMethods>;
}

