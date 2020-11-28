import {Router} from "./router";
import {Injector} from "@typeix/di";
import {IResolvedRoute, Route} from "./interfaces";
import {HttpMethod, toHttpMethod} from "./methods";
import {RouterError} from "./router-error";
import {Logger} from "@typeix/logger";

describe("Router", () => {

  let router: Router;

  beforeEach(() => {
    let rootInjector = new Injector();
    let injector = Injector.createAndResolve(Router, [
      {
        provide: Injector,
        useValue: rootInjector
      },
      Logger
    ]);
    router = injector.get(Router);
  });

  test("Parse request and create dynamic url", () => {

    class DynamicRule implements Route {
      parseRequest(pathName: string, method: string, headers: Headers): Promise<IResolvedRoute> {
        return Promise.resolve(null);
      }

      createUrl(routeName: string, params: Object): Promise<string> {
        return null;
      }

    }

    router.addRule(DynamicRule);

    return router.parseRequest("/", HttpMethod.GET, {}).then((data) => {
      let result = [];
      expect(data).toEqual(result);
    })
      .catch((error: RouterError) => {
        expect(error.getMessage()).toBe("Router.parseRequest: / no route found, method: GET");
      });
  });


  test("Parse request and create url", () => {


    router.addRules([
      {
        methods: [HttpMethod.OPTIONS],
        route: "controller/test",
        url: "*"
      },
      {
        methods: [HttpMethod.GET, HttpMethod.POST],
        route: "controller/index",
        url: "/"
      },
      {
        methods: [HttpMethod.GET, HttpMethod.POST],
        route: "controller/home",
        url: "/home"
      },
      {
        methods: [HttpMethod.GET],
        route: "controller/view",
        url: "/home/<id:(\\d+)>"
      }
    ]);

    return Promise.all([
      router.parseRequest("/", HttpMethod.POST, {}),
      router.parseRequest("/authenticate", HttpMethod.OPTIONS, {}),
      router.parseRequest("/home", HttpMethod.GET, {}),
      router.parseRequest("/home/123", HttpMethod.GET, {}),
      router.createUrl("controller/view", {id: 123}),
      router.createUrl("controller/index", {}),
      router.createUrl("controller/home", {}),
      router.createUrl("controller/indexs", {})
    ]).then((data) => {
      let result = [
        {
          method: HttpMethod.POST,
          params: {},
          route: "controller/index"
        },
        {
          method: HttpMethod.OPTIONS,
          params: {},
          route: "controller/test"
        },
        {
          method: HttpMethod.GET,
          params: {},
          route: "controller/home"
        },
        {
          method: HttpMethod.GET,
          params: {
            id: "123"
          },
          route: "controller/view"
        },
        "/home/123",
        "/",
        "/home",
        "/controller/indexs"
      ];

      expect(data).toEqual(result);
    });
  });


  test("Testing handlers", () => {


    let rootInjector = new Injector();
    let injector = Injector.createAndResolve(Router, [
      {provide: Injector, useValue: rootInjector},
      Logger
    ]);
    let router1 = injector.get(Router);
// adding rules

    router1.addRules([
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


    return Promise.all([
      router1.parseRequest("/", HttpMethod.POST, {}),
      router1.parseRequest("/", HttpMethod.GET, {}),
      router1.parseRequest("/authenticate", HttpMethod.OPTIONS, {}),
      router1.parseRequest("/home", HttpMethod.GET, {}),
      router1.parseRequest("/home/123", HttpMethod.GET, {}),
      router1.createUrl("handler4", {id: 123}),
      router1.createUrl("handler3", {}),
      router1.createUrl("handler2", {}),
      router1.createUrl("handler1", {})
    ]).then((data) => {
      let result = [
        {
          method: HttpMethod.POST,
          params: {},
          route: "handler2"
        },
        {
          method: HttpMethod.GET,
          params: {},
          route: "handler2"
        },
        {
          method: HttpMethod.OPTIONS,
          params: {},
          route: "handler1"
        },
        {
          method: HttpMethod.GET,
          params: {},
          route: "handler3"
        },
        {
          method: HttpMethod.GET,
          params: {
            id: "123"
          },
          route: "handler4"
        },
        "/home/123",
        "/home",
        "/",
        "/"
      ];

      expect(data).toEqual(result);
    });

  });

  test("Should invoke getError|hasError|setError", () => {
    let route = "core/error";
    router.setError(route);
    expect(router.hasError()).toBeTruthy();
    expect(route).toEqual(router.getError());
    router.setError("ABC/D"); // ignore second global route definition
    expect(route).toEqual(router.getError());
    router.setError("admin/error/index");
    expect("admin/error/index").toEqual(router.getError("admin"));
  });

  test("HttpMethod", () => {
    expect(toHttpMethod("GET")).toBe(HttpMethod.GET);
    expect(toHttpMethod("POST")).toBe(HttpMethod.POST);
  })


  test("Testing dynamic", () => {


    let rootInjector = new Injector();
    let injector = Injector.createAndResolve(Router, [
      {provide: Injector, useValue: rootInjector},
      Logger
    ]);
    let router1 = injector.get(Router);
// adding rules

    router1.addRules([
      {
        methods: [HttpMethod.GET],
        route: "<module>/<controller>/<action>",
        url: "/<module>/<controller>/<action>"
      },
      {
        methods: [HttpMethod.GET],
        route: "<controller>/<action>",
        url: "/<controller>/<action>"
      }
    ]);


    return Promise.all([
      router1.parseRequest("/account/create", HttpMethod.GET, {}),
      router1.parseRequest("/admin/account/create", HttpMethod.GET, {}),
      router1.createUrl("<controller>/<action>", {controller: "account", action: "create"}),
      router1.createUrl("<module>/<controller>/<action>", {
        module: "admin",
        controller: "account",
        action: "create"
      }),
    ]).then((data) => {
      let result = [
        {
          method: HttpMethod.GET,
          params: {controller: "account", action: "create"},
          route: "account/create"
        },
        {
          method: HttpMethod.GET,
          params: {module: "admin", controller: "account", action: "create"},
          route: "admin/account/create"
        },
        "/account/create",
        "/admin/account/create"
      ];

      expect(data).toEqual(result);
    });

  });

});
