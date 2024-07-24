import { describe, expect, test } from "vitest";

import { Relay, Router } from "~/index.js";
import {
  captureConsole,
  disableConsole,
  expectResponse,
  fail,
} from "~test/utils.js";

describe("Relay basic setup", () => {
  test("no configured relays", async () => {
    disableConsole();

    const relay = new Relay();
    const req = new Request("http://example.org/");
    const resp = await relay.fetch(req);
    await expectResponse(resp, { error: "Not Found" }, 404);
  });

  test("unused prefixes", async () => {
    disableConsole();

    const foo = new Router();
    foo.route("POST /foo/bar", fail);

    const relay = new Relay();
    relay.relay("/foo", foo);

    {
      const req = new Request("http://example.org/");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Not Found" }, 404); // thrown by Relay
    }

    {
      const req = new Request("http://example.org/bar");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Not Found" }, 404); // thrown by Relay
    }

    {
      const req = new Request("http://example.org/foo");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Not Found" }, 404); // thrown by Router, not by Relay!
    }

    {
      const req = new Request("http://example.org/foo/bar");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Method Not Allowed" }, 405); // thrown by Router, not by Relay!
    }
  });
});

describe("Misconfigured Relay instance", () => {
  test("invalid match prefix #1", () => {
    const relay = new Relay();
    expect(() => relay.relay("GET /foo" as any, new Router())).toThrow(
      "Invalid static path prefix: GET /foo"
    );
  });

  test("invalid match prefix #2", () => {
    const relay = new Relay();
    expect(() => relay.relay("/foo /bar" as any, new Router())).toThrow(
      "Invalid static path prefix: /foo /bar"
    );
  });

  test("invalid match prefix #3", () => {
    const relay = new Relay();
    expect(() => relay.relay("/<foo>" as any, new Router())).toThrow(
      "Invalid static path prefix: /<foo>"
    );
  });

  test("assigning a router that won't be able to handle a prefix is considered a misconfiguration", () => {
    const konsole = captureConsole();

    const foo = new Router();
    foo.route("GET /foo", fail);

    const relay = new Relay();
    relay.relay("/bar", foo);

    expect(konsole.warn).toHaveBeenCalledWith(
      "Warning: router supposed to handle prefix '/bar' has route that will never match: 'GET /foo'"
    );
  });
});
