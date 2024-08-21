import { expectType } from "tsd";
import { Relay, Router } from "zenrouter";

declare const req: Request;

async () => {
  const app = new Relay();
  app
    .relay("/foo/*", new Router())
    .relay("/bar/*", new Router())
    .relay("/qux/*", new Router())
    .relay("/*", new Router());
  expectType<Response>(await app.fetch(req, 1, "a", true));
};
