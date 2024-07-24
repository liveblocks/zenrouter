/* eslint-disable @typescript-eslint/no-unsafe-argument */

// TODO: Make this a local definition?
import type { Json, JsonObject } from "@liveblocks/core";
import type { Decoder } from "decoders";
import { formatShort } from "decoders";

import type {
  ExtractParams,
  MapReturnTypes,
  Matcher,
  Pattern,
} from "~/lib/path-matcher.js";
import { pathMatcher, splitMethodAndPattern } from "~/lib/path-matcher.js";
import { mapv, raise } from "~/lib/utils.js";
import type { HttpError } from "~/responses/index.js";
import { abort, json, ValidationError } from "~/responses/index.js";

import { attachContext, lookupContext } from "./contexts.js";
import type { ErrorHandlerFn } from "./ErrorHandler.js";
import { ErrorHandler } from "./ErrorHandler.js";

/**
 * An Incoming Request is what gets passed to every route handler. It includes
 * the raw (unmodified) request, the derived context (user-defined), the parsed
 * URL, the type-safe params `p`, the parsed query string `q`, and a verified
 * JSON body (if a decoder is provided).
 */
type IncomingReq<RC, TParams, TBody> = {
  /**
   * The incoming request.
   */
  req: Request;
  /**
   * The incoming request parsed URL.
   * This is equivalent to the result of `new URL(req.url)`.
   */
  url: URL;
  /**
   * The user-defined context associated with this request. This is the best
   * place to attach metadata you want to carry around along with the request,
   * without having to monkey-patch the request instance.
   *
   * Basically the result of calling the configured `getContext()` function on
   * the request.
   */
  ctx: RC;
  /**
   * The type-safe params available for this request. Automatically derived
   * from dynamic placeholders in the pattern.
   */
  p: TParams;
  /**
   * Convenience accessor for the parsed query string.
   * Equivalent to `Object.entries(url.searchParams)`.
   *
   * Will only contain single strings, even if a query param occurs multiple
   * times. If you need to read all of them, use the `url.searchParams` API
   * instead.
   */
  q: Record<string, string | undefined>;
  /**
   * Verified JSON body for this request, if a decoder instance was provided.
   */
  body: TBody;
};

/**
 * Limited version of an Incoming Request. This incoming request data is
 * deliberately limited until after a successful auth check. Only once the
 * request has been authorized, further parsing will happen.
 */
type LimitedIncomingReq<RC> = Omit<
  IncomingReq<RC, never, never>,
  "p" | "q" | "body"
>;

/**
 * Anything that can be returned from an endpoint implementation that would be
 * considered a valid response.
 */
type ResponseLike = Promise<Response | JsonObject> | Response | JsonObject;

// type AuthHandler<R extends Request, RC, TParams> = (
//   input: IncomingReq<R, RC, TParams>
// ) => boolean;

type RouteHandler<RC, TParams, TBody> = (
  input: IncomingReq<RC, TParams, TBody>
) => ResponseLike;

type RouteTuple<RC> = readonly [
  pattern: Pattern,
  matcher: Matcher,
  auth: AuthFn<RC>,
  bodyDecoder: Decoder<unknown> | null,
  handler: OpaqueRouteHandler<RC>,
];

type RouterOptions<
  RC,
  TParams extends Record<string, (input: string) => unknown>,
> = {
  errorHandler?: ErrorHandler;

  // Mandatory config
  getContext?: (req: Request, ...args: readonly any[]) => RC;
  authorize?: AuthFn<RC>;

  // Register any param decoders
  params?: TParams;

  // Optional config
  debug?: boolean;
};

export type AuthFn<RC> = (
  input: LimitedIncomingReq<RC>
) => boolean | Promise<boolean>;

type OpaqueRouteHandler<RC> = (
  input: IncomingReq<RC, OpaqueParams, unknown>
) => Promise<Response>;

type OpaqueParams = Record<string, unknown>;

export class Router<
  RC = null,
  TParams extends Record<string, (input: string) => unknown> = {},
> {
  #_debug: boolean;
  #_contextFn: (req: Request, ...args: readonly any[]) => RC;
  #_defaultAuthFn: AuthFn<RC>;
  #_routes: RouteTuple<RC>[];
  #_paramDecoders: TParams;
  #_errorHandler: ErrorHandler;

  constructor(options?: RouterOptions<RC, TParams>) {
    this.#_errorHandler = options?.errorHandler ?? new ErrorHandler();
    this.#_debug = options?.debug ?? false;
    this.#_contextFn = options?.getContext ?? (() => null as any as RC);
    this.#_defaultAuthFn =
      options?.authorize ??
      (() => {
        // TODO "...or specify an authorize function in this specific endpoint definition"
        console.error("This request was not checked for authorization. Please configure a generic `authorize` function in the Router constructor."); // prettier-ignore
        return Promise.resolve(false);
      });
    this.#_routes = [];
    this.#_paramDecoders = options?.params ?? ({} as TParams);
  }

  // --- PUBLIC APIs -----------------------------------------------------------------

  public get fetch(): (
    req: Request,
    ...rest: readonly any[]
  ) => Promise<Response> {
    if (this.#_routes.length === 0) {
      throw new Error("No routes configured yet. Try adding one?");
    }
    return this.#_tryDispatch.bind(this);
  }

  public route<P extends Pattern>(
    pattern: P,
    handler: RouteHandler<RC, ExtractParams<P, MapReturnTypes<TParams>>, never>
  ): void;
  public route<P extends Pattern, TBody>(
    pattern: P,
    bodyDecoder: Decoder<TBody>,
    handler: RouteHandler<RC, ExtractParams<P, MapReturnTypes<TParams>>, TBody>
  ): void;
  /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
  /* eslint-disable @typescript-eslint/no-unsafe-assignment */
  public route(first: any, second: any, third?: any): void {
    /* eslint-enable @typescript-eslint/explicit-module-boundary-types */
    const pattern = first;
    const bodyDecoder = arguments.length >= 3 ? second : null;
    const handler = arguments.length >= 3 ? third : second;
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    this.#_register(
      pattern,
      bodyDecoder,
      handler as RouteHandler<RC, OpaqueParams, unknown>
    );
  }

  public findMismatch(prefix: `/${string}`): string | null {
    prefix = prefix.endsWith("/") ? prefix : ((prefix + "/") as `/${string}`);
    for (const [pat] of this.#_routes) {
      let [, path] = splitMethodAndPattern(pat);
      path = path.endsWith("/") ? path : path + "/";
      if (!path.startsWith(prefix)) {
        return pat;
      }
    }
    return null;
  }

  public onUncaughtError(handler: ErrorHandlerFn<unknown, RC>): this {
    this.#_errorHandler.onUncaughtError(handler as ErrorHandlerFn<unknown>);
    return this;
  }

  public onError(
    handler: ErrorHandlerFn<HttpError | ValidationError, RC>
  ): this {
    //                                               ^^^^^^^^^^^^^^^
    //                                               Technically this isn't needed, because it is a subclass of
    //                                               HttpError already, but adding it here anyway for clarity.
    this.#_errorHandler.onError(handler as ErrorHandlerFn<unknown>);
    return this;
  }

  // public get registerCannedResponse() {
  //   const eh = this.#_errorHandler;
  //   return eh.registerCannedResponse.bind(eh);
  // }

  // --- PRIVATE APIs ----------------------------------------------------------------

  #_getContext(req: Request, ...args: readonly any[]): RC {
    return (
      lookupContext<RC>(req) ??
      attachContext(req, this.#_contextFn(req, ...args))
    );
  }

  #_register<P extends Pattern>(
    pattern: P,
    bodyDecoder: Decoder<unknown> | null,
    handler: RouteHandler<RC, OpaqueParams, unknown>
    // authFn?: OpaqueAuthFn<RC>
  ): void {
    const matcher = pathMatcher(pattern);
    this.#_routes.push([
      pattern,
      matcher,
      /* authFn ?? */ this.#_defaultAuthFn,
      bodyDecoder,
      wrap(handler),
    ]);
  }

  /**
   * Calls .#_dispatch(), but will catch any thrown error (which could be
   * a known HTTP error) or an uncaught error, and makes sure to always return
   * a Response.
   */
  async #_tryDispatch(
    req: Request,
    ...args: readonly any[]
  ): Promise<Response> {
    try {
      return await this.#_dispatch(req, ...args); // eslint-disable @typescript-eslint/no-unsafe-argument
    } catch (err) {
      return this.#_errorHandler.handle(err, { req, ctx: lookupContext(req) });
    }
  }

  /**
   * Given an incoming request, starts matching its URL to one of the
   * configured routes, and invoking it if a match is found. Will not (and
   * should not) perform any error handling itself.
   *
   * Can throw:
   * - HTTP 400, if a route matches, but its params are incorrectly encoded
   * - HTTP 403, if a route matches, but the request isn't correctly authorized
   * - HTTP 404, if none of the routes matches
   * - HTTP 405, if a route path matches, but its method did not
   * - HTTP 422, if a route matches, but its body could not be validated
   */
  async #_dispatch(req: Request, ...args: readonly any[]): Promise<Response> {
    const url = new URL(req.url);
    const log = this.#_debug
      ? /* istanbul ignore next */
        console.log.bind(console)
      : undefined;
    log?.(`Trying to match ${req.method} ${url.pathname}`);

    // Match routes in the given order
    let pathDidMatch = false;
    for (const tup of this.#_routes) {
      const [pattern, matcher, authorize, bodyDecoder, handler] = tup;

      const match = matcher.matchURL(url);
      if (match === null) {
        log?.(`  ...against ${pattern}? ❌ No match`);
        continue;
      } else {
        pathDidMatch = true;
        if (!matcher.matchMethod(req)) {
          log?.(
            `  ...against ${pattern}? 🧐 Path matches, but method did not! ${JSON.stringify(match)}`
          );
          continue;
        }

        log?.(`  ...against ${pattern}? ✅ Match! ${JSON.stringify(match)}`);

        const base = {
          req,
          url,
          ctx: this.#_getContext(req, ...args),
        };

        // Perform auth
        if (!(await authorize(base))) {
          return abort(403);
        }

        let p;
        try {
          p = mapv(match, decodeURIComponent);
        } catch (err) {
          // A malformed URI that cannot be decoded properly is a Bad Request
          return abort(400);
        }

        // Verify params
        try {
          p = mapv(p, (value, key) => {
            const decoder = this.#_paramDecoders[key];
            return decoder === undefined ? value : decoder(value);
          });
        } catch (err) {
          // A param that cannot be verified is a Bad Request
          return abort(400);
        }

        const decodeResult = bodyDecoder
          ? // TODO: This can throw if the body does not contain a valid JSON
            // request. If so, we should return a 400.
            bodyDecoder.decode(await parseJson(req))
          : null;

        if (decodeResult && !decodeResult.ok) {
          const errmsg = formatShort(decodeResult.error);
          throw new ValidationError(errmsg);
        }

        // Decode the body
        const input = {
          ...base,
          p,
          q: Object.fromEntries(url.searchParams),
          get body() {
            if (decodeResult === null) {
              raise("Cannot access body: this endpoint did not define a body decoder"); // prettier-ignore
            }
            return decodeResult.value;
          },
        };

        return await handler(input);
      }
    }

    if (pathDidMatch) {
      // If one of the paths did match, we can return a 405 error
      return abort(405);
    }

    return abort(404);
  }
}

/**
 * Helper to handle any endpoint handlers returning a JSON object, and turning
 * that into a 200 response if so.
 */
function wrap<RC>(
  handler: RouteHandler<RC, OpaqueParams, unknown>
): OpaqueRouteHandler<RC> {
  return async (input) => {
    const result = await handler(input);
    if (result instanceof Response) {
      return result;
    } else {
      return json(result, 200);
    }
  };
}

async function parseJson(req: Request): Promise<Json> {
  try {
    return (await req.json()) as Json;
  } catch (err) {
    return abort(400);
  }
}
