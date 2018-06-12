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
import {Router, RestMethods} from "@typeix/router";
import {Logger} from "@typeix/utils";
import {createServer} from "http";

// Injector
let rootInjector = new Injector();
let injector = Injector.createAndResolve(Router, [
  {provide: Injector, useValue: rootInjector},
  Logger
]);
let router = injector.get(Router);
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
    route: "handler3",
    url: "/home"
  },
  {
    methods: [RestMethods.GET],
    route: "handler4",
    url: "/home/<id:(\\d+)>"
  }
]);



```
