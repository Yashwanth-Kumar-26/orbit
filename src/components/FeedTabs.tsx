"use client";

import { cn } from "@/lib/utils";

type SortMode = "latest" | "trending";

type Props = {
  active: SortMode;
  onChange: (mode: SortMode) => void;
};

const tabs: { key: SortMode; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
];

export function FeedTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
            active === tab.key
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
