import {Router} from "./router";
import {Injector} from "@typeix/di";
import {Logger} from "@typeix/utils";
import {IResolvedRoute, Route} from "./interfaces";
import {RestMethods} from "./headers";
import {ServerError} from "./server-error";


describe("Router", () => {

  let router: Router;

  beforeEach(() => {
    let rootInjector = new Injector();
    let injector = Injector.createAndResolve(Router, [
      {provide: Injector, useValue: rootInjector},
      {provide: Logger, useClass: Logger}
    ]);
    router = injector.get(Router);
  });

  test("Parse request and create dynamic url", () => {

    class DynamicRule implements Route {
      parseRequest(pathName: string, method: string, headers: Headers): Promise<IResolvedRoute | boolean> {
        return Promise.resolve(true);
      }

      createUrl(routeName: string, params: Object): Promise<string | boolean> {
        return null;
      }

    }

    router.addRule(DynamicRule);

    return router.parseRequest("/", "GET", {}).then((data) => {
      let result = [];
      expect(data).toEqual(result);
    })
      .catch((error: ServerError) => {
       expect(error.getMessage()).toBe("Router.parseRequest: / no route found, method: GET");
      });
  });


  test("Parse request and create url", () => {


    router.addRules([
      {
        methods: [RestMethods.OPTIONS],
        route: "controller/test",
        url: "*"
      },
      {
        methods: [RestMethods.GET, RestMethods.POST],
        route: "controller/index",
        url: "/"
      },
      {
        methods: [RestMethods.GET, RestMethods.POST],
        route: "controller/home",
        url: "/home"
      },
      {
        methods: [RestMethods.GET],
        route: "controller/view",
        url: "/home/<id:(\\d+)>"
      }
    ]);

    return Promise.all([
      router.parseRequest("/", "POST", {}),
      router.parseRequest("/authenticate", "OPTIONS", {}),
      router.parseRequest("/home", "GET", {}),
      router.parseRequest("/home/123", "GET", {}),
      router.createUrl("controller/view", {id: 123}),
      router.createUrl("controller/index", {}),
      router.createUrl("controller/home", {}),
      router.createUrl("controller/indexs", {})
    ]).then((data) => {
      let result = [
        {
          method: RestMethods.POST,
          params: {},
          route: "controller/index"
        },
        {
          method: RestMethods.OPTIONS,
          params: {},
          route: "controller/test"
        },
        {
          method: RestMethods.GET,
          params: {},
          route: "controller/home"
        },
        {
          method: RestMethods.GET,
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
        route: "handler3",
        url: "/home"
      },
      {
        methods: [RestMethods.GET],
        route: "handler4",
        url: "/home/<id:(\\d+)>"
      }
    ]);


    return Promise.all([
      router1.parseRequest("/", "POST", {}),
      router1.parseRequest("/", "GET", {}),
      router1.parseRequest("/authenticate", "OPTIONS", {}),
      router1.parseRequest("/home", "GET", {}),
      router1.parseRequest("/home/123", "GET", {}),
      router1.createUrl("handler4", {id: 123}),
      router1.createUrl("handler3", {}),
      router1.createUrl("handler2", {}),
      router1.createUrl("handler1", {})
    ]).then((data) => {
      let result = [
        {
          method: RestMethods.POST,
          params: {},
          route: "handler2"
        },
        {
          method: RestMethods.GET,
          params: {},
          route: "handler2"
        },
        {
          method: RestMethods.OPTIONS,
          params: {},
          route: "handler1"
        },
        {
          method: RestMethods.GET,
          params: {},
          route: "handler3"
        },
        {
          method: RestMethods.GET,
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


});
