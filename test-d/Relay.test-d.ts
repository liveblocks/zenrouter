import { describe, expectTypeOf, test } from "vitest";

import { ZenRelay, ZenRouter } from "~/index.js";

declare const req: Request;

describe("ZenRelay", () => {
  test("fetch returns a Response", async () => {
    const app = new ZenRelay();
    app
      .relay("/foo/*", new ZenRouter())
      .relay("/bar/*", new ZenRouter())
      .relay("/qux/*", new ZenRouter())
      .relay("/*", new ZenRouter());
    expectTypeOf(await app.fetch(req, 1, "a", true)).toEqualTypeOf<Response>();
  });
});
