import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  AI: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  SaaS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Open Source": "bg-green-500/10 text-green-400 border-green-500/20",
  "Web App": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  "Mobile App": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DApp: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Automation: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Hackathon: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Startup: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function TrendingBadge({ category }: { category: string }) {
  const colors = categoryColors[category] || "bg-gray-500/10 text-gray-400";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors,
      )}
    >
      {category}
    </span>
  );
}
