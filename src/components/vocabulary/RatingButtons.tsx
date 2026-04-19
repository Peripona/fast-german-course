"use client";

import type { Rating } from "@/lib/types";
import { Button } from "@/components/ui/button";

const labels: { id: Rating; label: string; shortcut: string; variant: "destructive" | "secondary" | "default" | "outline" }[] = [
  { id: "again", label: "Again", shortcut: "1", variant: "destructive" },
  { id: "hard", label: "Hard", shortcut: "2", variant: "outline" },
  { id: "good", label: "Good", shortcut: "3", variant: "secondary" },
  { id: "easy", label: "Easy", shortcut: "4", variant: "default" },
];

export function RatingButtons({ onRate }: { onRate: (r: Rating) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {labels.map(({ id, label, shortcut, variant }) => (
        <Button
          key={id}
          type="button"
          variant={variant}
          className="h-auto flex-col gap-0.5 py-3"
          onClick={() => onRate(id)}
        >
          <span>{label}</span>
          <span className="text-[10px] opacity-70">{shortcut}</span>
        </Button>
      ))}
    </div>
  );
}
