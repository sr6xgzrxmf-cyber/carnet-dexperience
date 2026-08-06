"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@vercel/analytics";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventName: string;
  eventData?: Record<string, string | number | boolean>;
};

export default function TrackedLink({
  eventName,
  eventData,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        track(eventName, eventData);
        onClick?.(event);
      }}
    />
  );
}

