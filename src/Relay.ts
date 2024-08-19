/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { raise } from "~/lib/utils.js";
import { abort } from "~/responses/index.js";
import { Router } from "~/Router.js";

import { lookupContext } from "./contexts.js";
import { ErrorHandler } from "./ErrorHandler.js";

const prefixRegExp = /^(\/[\w-]+)+$/;

type RequestHandler = (
  req: Request,
  ...args: readonly any[]
) => Promise<Response>;

type RelayOptions = {
  errorHandler?: ErrorHandler;
};

/**
 * Relay won't do any route handling itself. It will just try to hand-off any
 * incoming request to one of the configured routers. It will return a generic
 * 404 in case no configured prefix matches.
 */
export class Relay {
  #_errorHandler: ErrorHandler;
  #_routers: [prefixMatcher: RegExp, handler: RequestHandler][] = [];

  constructor(options?: RelayOptions) {
    this.#_errorHandler = options?.errorHandler ?? new ErrorHandler();
  }

  public get fetch(): (
    req: Request,
    ...rest: readonly any[]
  ) => Promise<Response> {
    return this.#_tryDispatch.bind(this);
  }

  public relay(
    staticPrefix: `/${string}`,
    router:
      | Router<any, any, any>
      //
      // NOTE: "RequestHandler" here is only allowed here to allow passing an
      // IttyRouter.handle instance here directly. Itty router is not built with
      // the same concepts as Zenrouter in mind (for example, it can return
      // `undefined` instead of a Response to trigger a fallthrough). Overall,
      // it's better to remove this again once we're done refactoring away all
      // instances of Itty router.
      | RequestHandler
  ): this {
    prefixRegExp.test(staticPrefix) || raise(`Invalid static path prefix: ${staticPrefix}`); // prettier-ignore

    // Perform sanity check if this is a Router instance
    if (router instanceof Router) {
      const mismatch = router.findMismatch(staticPrefix);
      if (mismatch !== null) {
        console.warn(
          `Warning: router supposed to handle prefix '${staticPrefix}' has route that will never match: '${mismatch}'`
        );
      }
    }

    // Register the prefix matcher
    const prefixMatcher = new RegExp(`^${staticPrefix}(/|$)`);
    this.#_routers.push([
      prefixMatcher,
      router instanceof Router ? router.fetch : router,
    ]);
    return this; // Allow chaining
  }

  async #_tryDispatch(
    req: Request,
    ...args: readonly any[]
  ): Promise<Response> {
    try {
      return await this.#_dispatch(req, ...args);
    } catch (err) {
      // Unexpected, this should never happen
      // TODO Verify... is this indeed never happening? Also not when a 404 is thrown below in #_dispatch?
      console.error(`Relayer caught error in subrouter! This should never happen, as routers should never throw an unexpected error! ${String(err)}`); // prettier-ignore
      return this.#_errorHandler.handle(err, {
        req,
        ctx: lookupContext(req),
      });
    }
  }

  #_dispatch(req: Request, ...args: readonly any[]): Promise<Response> {
    const path = new URL(req.url).pathname;
    for (const [matcher, handler] of this.#_routers) {
      if (matcher.test(path)) {
        return handler(req, ...args);
      }
    }

    console.warn(`Relayer does not know how to handle requested path: ${path}`); // prettier-ignore
    return abort(404);
  }
}
