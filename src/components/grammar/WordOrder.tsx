"use client";

import { useState } from "react";
import type { WordOrderExercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AudioButton } from "@/components/ui/AudioButton";

export function WordOrder({
  exercise,
  onResult,
}: {
  exercise: WordOrderExercise;
  onResult: (correct: boolean) => void;
}) {
  const [pool, setPool] = useState(() => [...exercise.words]);
  const [built, setBuilt] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const add = (w: string, fromPool: number) => {
    if (submitted) return;
    setPool((p) => p.filter((_, i) => i !== fromPool));
    setBuilt((b) => [...b, w]);
  };

  const removeLast = () => {
    if (submitted || built.length === 0) return;
    const w = built[built.length - 1];
    setBuilt((b) => b.slice(0, -1));
    setPool((p) => [...p, w]);
  };

  const check = () => {
    setSubmitted(true);
    const ok =
      built.length === exercise.correctOrder.length &&
      built.every((w, i) => w === exercise.correctOrder[i]);
    onResult(ok);
  };

  const correct =
    submitted &&
    built.length === exercise.correctOrder.length &&
    built.every((w, i) => w === exercise.correctOrder[i]);

  const correctSentence = exercise.correctOrder.join(" ");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Tap words in order.</p>
      <div className="flex min-h-12 flex-wrap gap-2 rounded-md border border-dashed border-border p-2">
        {built.map((w, i) => (
          <span key={`${w}-${i}`} className="rounded bg-muted px-2 py-1 text-sm">
            {w}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <Button
            key={`${w}-${i}`}
            type="button"
            size="sm"
            variant="secondary"
            disabled={submitted}
            onClick={() => add(w, i)}
          >
            {w}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {!submitted && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={removeLast}>
              Undo
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={check}
              disabled={built.length !== exercise.correctOrder.length}
            >
              Check
            </Button>
          </>
        )}
      </div>
      {submitted && (
        <div
          className={cn(
            "rounded-md p-3 text-sm",
            correct ? "bg-green-500/10 text-green-800 dark:text-green-200" : "bg-destructive/10",
          )}
        >
          {correct ? (
            "Correct!"
          ) : (
            <span className="flex items-center gap-2">
              Expected: {correctSentence}
              <AudioButton text={correctSentence} />
            </span>
          )}
          {exercise.explanation && (
            <p className="mt-2 text-muted-foreground">{exercise.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
