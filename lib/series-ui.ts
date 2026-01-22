import type { SeriesColor } from "./series-catalog";

export function seriesColorClass(color: SeriesColor): string {
  // Pastille + bordure légère, compatible Tailwind
  switch (color) {
    case "slate":
      return "bg-slate-500/90";
    case "blue":
      return "bg-blue-500/90";
    case "green":
      return "bg-green-500/90";
    case "amber":
      return "bg-amber-500/90";
    case "red":
      return "bg-red-500/90";
    case "violet":
      return "bg-violet-500/90";
    case "pink":
      return "bg-pink-500/90";
    case "teal":
      return "bg-teal-500/90";
    default:
      return "bg-slate-500/90";
  }
}
