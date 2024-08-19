import { describe, expect, test } from "vitest";

import { abort, json, Relay, Router } from "~/index.js";
import {
  captureConsole,
  disableConsole,
  expectResponse,
  fail,
} from "~test/utils.js";

const IGNORE_AUTH_FOR_THIS_TEST = () => Promise.resolve(true);

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

describe("Error handling behavior", () => {
  test("aborting vs throwing custom error (which remains uncaught)", async () => {
    const konsole = captureConsole();
    const router = new Router({
      authorize: IGNORE_AUTH_FOR_THIS_TEST,
    });
    router.route("GET /test/403", () => abort(403));
    router.route("GET /test/oops", () => {
      throw new Error("Oops");
    });

    const relay = new Relay().relay("/test", router);

    {
      const req = new Request("http://example.org/test/403");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Forbidden" }, 403);
    }
    {
      const req = new Request("http://example.org/test/oops");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Internal Server Error" }, 500);
    }

    expect(konsole.log).not.toHaveBeenCalled();
    expect(konsole.warn).not.toHaveBeenCalled();
    expect(konsole.error).toHaveBeenCalledWith(
      expect.stringMatching("Uncaught error: Error: Oops")
    );
    expect(konsole.error).toHaveBeenCalledWith(
      "...but no uncaught error handler was set up for this router."
    );
  });

  test("same, but now uncaught handler is defined (at the Router level)", async () => {
    const konsole = captureConsole();
    const router = new Router({
      authorize: IGNORE_AUTH_FOR_THIS_TEST,
    });
    router.onUncaughtError(() => json({ custom: "error" }, 500));

    router.route("GET /test/403", () => abort(403));
    router.route("GET /test/oops", () => {
      throw new Error("Oops");
    });

    const relay = new Relay().relay("/test", router);

    {
      const req = new Request("http://example.org/test/403");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { error: "Forbidden" }, 403);
    }
    {
      const req = new Request("http://example.org/test/oops");
      const resp = await relay.fetch(req);
      await expectResponse(resp, { custom: "error" }, 500);
    }

    expect(konsole.log).not.toHaveBeenCalled();
    expect(konsole.warn).not.toHaveBeenCalled();
    expect(konsole.error).not.toHaveBeenCalled();
    expect(konsole.error).not.toHaveBeenCalled();
  });

  test("same, but now there is no Router (we're using a custom handler function) #1", async () => {
    const app = new Relay().relay(
      "/oops",
      // NOTE! *Not* using a Router instance here, instead using a custom
      // handler function directly! This is NOT recommended, but currently
      // supported only to allow using itty-router here!
      () => {
        throw new Error("Oops");
      }
    );

    const konsole = captureConsole();

    const req = new Request("http://example.org/haha"); // NOTE: Not calling /oops here!
    const resp = await app.fetch(req);
    await expectResponse(resp, { error: "Not Found" }, 404);

    expect(konsole.log).not.toHaveBeenCalled();
    expect(konsole.warn).toHaveBeenCalledWith(
      "Relayer did not know how to handle requested path: /haha"
    );
    expect(konsole.error).not.toHaveBeenCalled();
  });

  test("same, but now there is no Router (we're using a custom handler function) #2", async () => {
    const app = new Relay().relay(
      "/oops",
      // NOTE! *Not* using a Router instance here, instead using a custom
      // handler function directly! This is NOT recommended, but currently
      // supported only to allow using itty-router here!
      () => {
        throw new Error("Oops");
      }
    );

    const konsole = captureConsole();

    const req = new Request("http://example.org/oops");
    const resp = await app.fetch(req);
    await expectResponse(resp, { error: "Internal Server Error" }, 500);

    expect(konsole.log).not.toHaveBeenCalled();
    expect(konsole.warn).not.toHaveBeenCalled();
    expect(konsole.error).toHaveBeenCalledTimes(3);
    expect(konsole.error).toHaveBeenCalledWith(
      "Relayer caught error in subrouter! This should never happen, as routers should never throw an unexpected error! Error: Oops"
    );
    expect(konsole.error).toHaveBeenCalledWith(
      expect.stringMatching("Uncaught error: Error: Oops")
    );
    expect(konsole.error).toHaveBeenCalledWith(
      "...but no uncaught error handler was set up for this router."
    );
  });
});
