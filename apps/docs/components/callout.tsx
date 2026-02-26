"use client";

import type { ReactNode } from "react";

const typeConfig = {
  info: {
    label: "Info",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 currentColor"
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4Zm2 8.063H6v-1.126h1.438V8.063H6.5V6.937h2.063v4H10v1.126Z"></path>
      </svg>
    ),
    className: "[--callout-accent:var(--color-fd-foreground)]",
  },
  success: {
    label: "Success",
    icon: (
      <svg
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 currentColor"
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm-1 9.795-2.5-2.5.795-.795L7 9.205 10.705 5.5l.798.793L7 10.795Z"></path>
      </svg>
    ),
    className: "[--callout-accent:#187b4f] dark:[--callout-accent:#25d0ab]",
  },
  warning: {
    label: "Warning",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 currentColor"
      >
        <path d="M8 1C4.15 1 1 4.15 1 8s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7Zm-.55 3h1.1v5.5h-1.1V4ZM8 12.5c-.4 0-.75-.35-.75-.75S7.6 11 8 11s.75.35.75.75-.35.75-.75.75Z"></path>
      </svg>
    ),
    className: "[--callout-accent:#946800] dark:[--callout-accent:#f0c000]",
  },
  error: {
    label: "Error",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3.5 currentColor"
      >
        <path d="M8 1C4.15 1 1 4.15 1 8s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7Zm-.55 3h1.1v5.5h-1.1V4ZM8 12.5c-.4 0-.75-.35-.75-.75S7.6 11 8 11s.75.35.75.75-.35.75-.75.75Z"></path>
      </svg>
    ),
    className: "[--callout-accent:#ce2c31] dark:[--callout-accent:#ff666b]",
  },
} as const;

export type CalloutType = keyof typeof typeConfig;

export interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = typeConfig[type];

  return (
    <aside
      className={`my-4 rounded-md border pl-4 pr-4 py-4 ${config.className}`}
      data-callout={type}
      aria-label={config.label}
    >
      <div className="flex gap-3">
        <span
          className="text-lg leading-none shrink-0 text-(--callout-accent) pt-[3px]"
          aria-hidden
        >
          {config.icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
          {title != null && title !== "" && (
            <p className="font-semibold text-sm text-(--callout-accent) mb-1">
              {title}
            </p>
          )}
          <div className="text-sm *:my-0">{children}</div>
        </div>
      </div>
    </aside>
  );
}
