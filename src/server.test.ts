import {Injector} from "@typeix/di";
import {Logger, ServerError} from "@typeix/utils";
import {createServer, IncomingMessage, ServerResponse} from "http";
import {RestMethods, Router, IResolvedRoute} from "./index";

// Injector
let rootInjector = new Injector();
let injector = Injector.createAndResolve(Router, [
  {provide: Injector, useValue: rootInjector},
  Logger
]);
let router: Router = injector.get(Router);
// adding rules

router.addRules([
  {
    methods: [RestMethods.OPTIONS],
    route: "handler1",
    url: "*"
  },
  {
    methods: [RestMethods.GET, RestMethods.POST],
    route: "handler2",
    url: "/"
  },
  {
    methods: [RestMethods.GET, RestMethods.POST],
    route: "favicon",
    url: "/favicon.ico"
  },
  {
    methods: [RestMethods.GET, RestMethods.POST],
    route: "handler3",
    url: "/home"
  },
  {
    methods: [RestMethods.GET],
    route: "handler4",
    url: "/home/<id:(\\d+)>"
  }
]);

/**
 * Route handlers can be any function / object
 */
const handlers = {
  handler1: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 1: " + JSON.stringify(route));
  },
  handler2: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 2: " + JSON.stringify(route));
  },
  handler3: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 3: " + JSON.stringify(route));
  },
  handler4: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("handler 4: " + JSON.stringify(route));
  },
  favicon: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.end("X");
  },
  error: function (error: ServerError, response: ServerResponse) {
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
    let route: IResolvedRoute = await router.parseRequest(request.url, request.method, request.headers);
    handlers[route.route].call({}, route, response);
  } catch (e) {
    handlers.error.call({}, e, response);
  }
}

let serverTest = createServer();
serverTest.on("request", requestHandler);
serverTest.listen(4000);
