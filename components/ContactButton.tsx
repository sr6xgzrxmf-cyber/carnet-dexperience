// components/ContactButton.tsx
import Link from "next/link";

type Props = {
  className?: string;
  label?: string;
};

export default function ContactButton({
  className = "",
  label = "Me contacter",
}: Props) {
  return (
    <Link
      href="/contact"
      className={[
        "inline-flex items-center justify-center whitespace-nowrap",
        "rounded-xl px-4 py-2 text-sm font-medium",
        "transition",
        // style par défaut (si aucune classe n’est passée)
        className ||
          "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}