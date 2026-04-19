"use client";

import { useState } from "react";
import type { FillBlankExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function FillBlank({
  exercise,
  onResult,
}: {
  exercise: FillBlankExercise;
  onResult: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const correct =
    submitted &&
    (normalize(value) === normalize(exercise.answer) ||
      exercise.alternatives?.some((a) => normalize(value) === normalize(a)));

  const submit = () => {
    setSubmitted(true);
    const ok =
      normalize(value) === normalize(exercise.answer) ||
      Boolean(exercise.alternatives?.some((a) => normalize(value) === normalize(a)));
    onResult(ok);
  };

  return (
    <div className="space-y-3">
      <p className="font-medium">{exercise.prompt}</p>
      <input
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value}
        disabled={submitted}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Your answer"
      />
      {!submitted ? (
        <Button type="button" onClick={submit}>
          Check
        </Button>
      ) : (
        <div
          className={cn(
            "rounded-md p-3 text-sm",
            correct ? "bg-green-500/10 text-green-800 dark:text-green-200" : "bg-destructive/10",
          )}
        >
          {correct ? "Correct!" : `Expected: ${exercise.answer}`}
          {exercise.explanation && <p className="mt-2 text-muted-foreground">{exercise.explanation}</p>}
        </div>
      )}
    </div>
  );
}
