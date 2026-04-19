"use client";

import { useState } from "react";
import type { MultipleChoiceExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MultipleChoice({
  exercise,
  onResult,
}: {
  exercise: MultipleChoiceExercise;
  onResult: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  const select = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    onResult(idx === exercise.correctIndex);
  };

  return (
    <div className="space-y-3">
      <p className="font-medium">{exercise.question}</p>
      <div className="flex flex-col gap-2">
        {exercise.options.map((opt, idx) => (
          <Button
            key={opt}
            type="button"
            variant="outline"
            className={cn(
              "justify-start text-left",
              picked !== null &&
                idx === exercise.correctIndex &&
                "border-green-600 bg-green-500/10",
              picked !== null &&
                picked === idx &&
                idx !== exercise.correctIndex &&
                "border-destructive bg-destructive/10",
            )}
            onClick={() => select(idx)}
            disabled={picked !== null}
          >
            {opt}
          </Button>
        ))}
      </div>
      {picked !== null && exercise.explanation && (
        <p className="text-sm text-muted-foreground">{exercise.explanation}</p>
      )}
    </div>
  );
}
