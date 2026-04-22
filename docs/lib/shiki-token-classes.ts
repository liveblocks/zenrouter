import type { ShikiTransformer } from "shiki";

/** Semantic scope segments we care about; first match wins when scanning scope chain. Comment before string so comments never get tk-string. */
const SEMANTIC_SCOPE_PRIORITY = [
  "comment",
  "string",
  "keyword",
  "entity",
  "tag",
  "storage",
  "support",
  "constant",
  "variable",
  "punctuation",
  "meta",
] as const;

/** Adds tk-* classes to token spans from TextMate scope (e.g. tk-variable, tk-string). Needs includeExplanation: "scopeName". */
export function shikiTokenClassTransformer(): ShikiTransformer {
  return {
    name: "shiki-token-class",
    span(hast, _line, _col, _lineElement, token) {
      const explanation = token.explanation;
      if (!explanation?.[0]?.scopes?.length) return;

      const scopes = explanation[0].scopes;
      const firstSegments = new Set(
        scopes
          .map((s) => (s?.scopeName ?? "").split(".")[0])
          .filter(Boolean),
      );

      const segment = SEMANTIC_SCOPE_PRIORITY.find((s) => firstSegments.has(s));
      if (!segment) return;

      const existing = hast.properties?.className;
      const classes = Array.isArray(existing)
        ? [...existing]
        : typeof existing === "string"
          ? existing.split(/\s+/).filter(Boolean)
          : [];
      const tokenClass = `tk-${segment}`;
      if (!classes.includes(tokenClass)) {
        classes.push(tokenClass);
      }
      hast.properties = hast.properties ?? {};
      hast.properties.className = classes;
      return hast;
    },
  };
}
