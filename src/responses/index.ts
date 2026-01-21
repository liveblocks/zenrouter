import type { JsonObject } from "@liveblocks/core";

import type { HeadersInit } from "./compat.js";
import { HttpError, ValidationError } from "./HttpError.js";

/**
 * WeakSet tracking "generic" abort responses.
 * Generic responses can be replaced by the error handler with custom error formatting.
 * Non-generic responses (e.g., custom json() responses) are returned verbatim.
 */
const genericAborts = new WeakSet<Response>();

/**
 * Checks if a Response is a generic abort response (created by abort()).
 */
export function isGenericAbort(resp: Response): boolean {
  return genericAborts.has(resp);
}

/**
 * Returns an empty HTTP 204 response.
 */
export function empty(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Return a JSON response.
 */
export function json(
  value: JsonObject,
  status = 200,
  headers?: HeadersInit
): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

/**
 * Return an HTML response.
 */
export function html(
  content: string,
  status = 200,
  headers?: HeadersInit
): Response {
  return new Response(content, {
    status,
    headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Throws a generic abort Response for the given status code. Use this to
 * terminate the handling of a route and return an HTTP error to the user.
 *
 * The response body will be determined by the configured error handler.
 * To return a custom error body that won't be replaced, throw a json() response instead.
 */
export function abort(status: number, headers?: HeadersInit): never {
  const resp = new Response(null, { status, headers });
  genericAborts.add(resp);
  throw resp;
}

export { HttpError, ValidationError };
