import {Injector} from "@typeix/di";
import {Router, HttpMethod, IResolvedRoute, RouterError, toHttpMethod} from "../";
import {isObject} from "@typeix/utils";
import {createServer, IncomingMessage, ServerResponse} from "http";
import {Logger, configure, getLogger} from "log4js";
import * as log4j from "log4js";
// Root injector used for dynamic routing
log4j.addLayout('json', function (config) {
  return function (logEvent) {
    return JSON.stringify(logEvent) + config.separator;
  }
});
let rootInjector = new Injector();
let injector = Injector.createAndResolve(Router, [
  {provide: Injector, useValue: rootInjector},
  {
    provide: "logger",
    useFactory: () => {
      return log4j.configure({
        appenders: {
          out: { type: 'stdout', layout: { type: 'json', separator: ',' } }
        },
        categories: {
          default: { appenders: ['out'], level: 'info' }
        }
      }).getLogger();
    },
    providers: []
  }
]);
let router: Router = injector.get(Router);
// adding rules

router.addRules([
  {
    methods: [HttpMethod.OPTIONS],
    route: "handler1",
    url: "*"
  },
  {
    methods: [HttpMethod.GET, HttpMethod.POST],
    route: "handler2",
    url: "/"
  },
  {
    methods: [HttpMethod.GET],
    route: "favicon",
    url: "/favicon.ico"
  },
  {
    methods: [HttpMethod.GET, HttpMethod.POST],
    route: "handler3",
    url: "/home"
  },
  {
    methods: [HttpMethod.GET],
    route: "handler4",
    url: "/home/<id:(\\d+)>"
  }
]);
/**
 * Nice route print
 * @param {IResolvedRoute} route
 * @returns {string}
 */
function routeToString(route: IResolvedRoute) {
  return JSON.stringify(Object.assign(route, {method: route.method}));
}
/**
 * Route handlers can be any function / object
 */
const handlers = {
  handler1: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 1: " + routeToString(route));
  },
  handler2: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 2: " + routeToString(route));
  },
  handler3: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 3: " + routeToString(route));
  },
  handler4: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 4: " + routeToString(route));
  },
  favicon: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("favicon.ico");
  },
  error: function (error: RouterError, response: ServerResponse) {
    response.writeHead(error.getCode(), {});
    response.end("error: " + JSON.stringify(error));
  }
};


/**
 * Request handler example
 * @param {module:http.IncomingMessage} request
 * @param {module:http.ServerResponse} response
 * @returns {Promise<void>}
 */
async function requestHandler(request: IncomingMessage, response: ServerResponse) {
  try {
    let route: IResolvedRoute = await router.parseRequest(request.url, toHttpMethod(request.method), request.headers);
    handlers[route.route].call({}, route, response);
  } catch (e) {
    handlers.error.call({}, e, response);
  }
}

let server = createServer();
server.on("request", requestHandler);
server.listen(4000);
