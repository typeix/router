# @typeix/router

Missing router for node js

Installing:
```bash
npm i @typeix/di --save
npm i @typeix/router --save
npm i @typeix/utils --save
```

Example of usage:
```typescript
import {Injector} from "@typeix/di";
import {Router, RestMethods, IResolvedRoute} from "@typeix/router";
import {Logger, isObject, ServerError} from "@typeix/utils";
import {createServer, IncomingMessage, ServerResponse} from "http";

// Root injector used for dynamic routing
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
    response.write("handler 1: " + JSON.stringify(route));
    response.end();
  },
  handler2: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.write("handler 2: " + JSON.stringify(route));
    response.end();
  },
  handler3: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.write("handler 3: " + JSON.stringify(route));
    response.end();
  },
  handler4: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.write("handler 4: " + JSON.stringify(route));
    response.end();
  },
  favicon: function (route: IResolvedRoute, response: ServerResponse) {
    response.writeHead(200, {});
    response.write("X");
    response.end();
  },
  error: function (error: ServerError, response: ServerResponse) {
    response.writeHead(200, {});
    response.write("error: " + JSON.stringify(error));
    response.end();
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

let server = createServer();
server.on("request", requestHandler);
server.listen(4000);
```
