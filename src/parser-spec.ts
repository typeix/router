import {RouteParser} from "./parser";

describe("Parser", () => {
  test("parse", () => {

    let route = "/can<any>one/<name:\\w+>/should<now:\\W+>do-it/<see:(\\w+)>-<nice:([a-zA-Z]+)>-now-<only:\\d+>-not/user/<id:\\d+>";
    let parser = new RouteParser(route);

    expect(parser).toBeInstanceOf(RouteParser);
  });
});
