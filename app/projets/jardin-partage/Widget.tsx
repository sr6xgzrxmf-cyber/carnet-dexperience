"use client";

export default function Widget({ html }: { html: string }) {
  return (
    <iframe
      srcDoc={html}
      title="Le Jardin Partagé — prototype"
      className="mt-6 w-full rounded-2xl border border-neutral-200 dark:border-neutral-800"
      style={{ height: "1500px", colorScheme: "light" }}
    />
  );
}
