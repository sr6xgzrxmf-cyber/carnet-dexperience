"use client";

let installed = false;

function install() {
  if (installed) return;
  installed = true;

  const wrap = (method: "error" | "warn") => {
    const orig = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      try {
        const text = args.map((a) => (typeof a === "string" ? a : "")).join(" ");
        const isKeyWarn =
          text.includes('Each child in a list should have a unique "key" prop') ||
          text.includes("warning-keys") ||
          text.includes('unique "key" prop');

        if (isKeyWarn) {
          // React met souvent le component stack en 2e argument string
          const stackArg = args.find((a) => typeof a === "string" && a.includes("\n    at "));
          console.group(`🔎 KEY WARNING via console.${method}`);
          console.log("args:", args);
          if (stackArg) console.log("component stack:\n" + stackArg);
          console.trace("trace");
          console.groupEnd();
        }
      } catch {}
      return orig(...args);
    };
  };

  wrap("error");
  wrap("warn");
}

// installé dès l’import (avant rendu)
install();

export default function DevKeyWarningTrace() {
  return null;
}
