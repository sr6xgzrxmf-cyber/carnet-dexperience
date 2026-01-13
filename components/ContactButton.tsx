import Link from "next/link";

type Props = {
  className?: string;
  label?: string;
};

export default function ContactButton({ className, label = "Contacter" }: Props) {
  return (
    <Link
      href="/contact"
      className={[
        "inline-flex items-center justify-center rounded-full",
        "border border-neutral-200 dark:border-neutral-800",
        "bg-white/50 dark:bg-neutral-950/30",
        "px-4 py-2 text-sm",
        "hover:border-neutral-400 dark:hover:border-neutral-600",
        "transition",
        className ?? "",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}