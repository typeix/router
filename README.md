# @typeix/router

Missing router for node js

## Required
- Node.js gte 6.x
- Typescript gte 2.x

## Installing:
```bash
npm i @typeix/di @typeix/router @typeix/utils --save
npm i @types/node --save-dev
```

## Example of usage:
```typescript
import {Injector} from "@typeix/di";
import {Router, HttpMethod, IResolvedRoute, RouterError, toHttpMethod} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";
import {Logger} from "@typeix/logger";

let rootInjector = new Injector();
let injector = Injector.createAndResolve(Router, [
  {provide: Injector, useValue: rootInjector},
  Logger
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

```

### Running routes:
- ```/```  outputs ```handler 2: {"method":"GET","params":{},"route":"handler2"}``` works with post as well
- ```/home```  outputs ```handler 3: {"method":"GET","params":{},"route":"handler3"}``` works with post as well
- ```/home/123```  outputs ```handler 4: {"method":"GET","params":{"id":"123"},"route":"handler4"}``` works with post as well
- ```/home/444```  outputs ```handler 4: {"method":"GET","params":{"id":"444"},"route":"handler4"}``` works with post as well
- ```/home/444d```  outputs ```error: {"code":404}``` invalid because it does not match  "/home/<id:(\\d+)>" regex
- ```/unknown```  outputs ```error: {"code":404}``` not valid route
- ```/favicon.ico```  outputs ```favicon.ico``` string
