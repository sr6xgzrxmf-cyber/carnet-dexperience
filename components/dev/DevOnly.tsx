"use client";

export default function DevOnly({ children }: { children: React.ReactNode }) {
  return process.env.NODE_ENV !== "production" ? <>{children}</> : null;
}
