import {RestMethods} from "./headers";
import {RouteRule} from "./route-rule";
import {Injector} from "@typeix/di";

describe("RouteRule", () => {
  it("Parse route and create url", () => {
    let config = {
      methods: [RestMethods.GET, RestMethods.POST],
      route: "core/index",
      url: "/home/<id:(\\d+)>"
    };
    let injector = Injector.createAndResolve(RouteRule, [{provide: "config", useValue: config}]);
    let route = injector.get(RouteRule);
    expect(route).not.toBeNull();
    return Promise
      .all([
        route.parseRequest("/home/123", "GET", {}),
        route.parseRequest("/home/123", "POST", {}),
        route.parseRequest("/home/123", "CONNECT", {}),
        route.createUrl("core/index", {id: 123})
      ])
      .then(data => {
        let result = [
          {
            method: RestMethods.GET,
            params: {
              id: "123"
            },
            route: "core/index"
          },
          {
            method: RestMethods.POST,
            params: {
              id: "123"
            },
            route: "core/index"
          },
          false,
          "/home/123"
        ];
        expect(data).toEqual(result);
      });
  });
});
