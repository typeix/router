import {HttpMethod} from "./methods";
import {RouteRule} from "./route-rule";
import {Injector} from "@typeix/di";

describe("RouteRule", () => {
  it("Parse route and create url", () => {
    let config = {
      methods: [HttpMethod.GET, HttpMethod.POST],
      route: "core/index",
      url: "/home/<id:(\\d+)>"
    };
    let injector = Injector.createAndResolve(RouteRule, [{provide: "config", useValue: config}]);
    let route = injector.get(RouteRule);
    expect(route).not.toBeNull();
    return Promise
      .all([
        route.parseRequest("/home/123", HttpMethod.GET, {}),
        route.parseRequest("/home/123", HttpMethod.POST, {}),
        route.parseRequest("/home/123", HttpMethod.CONNECT, {}),
        route.createUrl("core/index", {id: 123})
      ])
      .then(data => {
        let result = [
          {
            method: HttpMethod.GET,
            params: {
              id: "123"
            },
            route: "core/index"
          },
          {
            method: HttpMethod.POST,
            params: {
              id: "123"
            },
            route: "core/index"
          },
          null,
          "/home/123"
        ];
        expect(data).toEqual(result);
      });
  });
});
