"use client";

import { useMemo, useState } from "react";
import type { GrammarExercise, GrammarLesson } from "@/lib/types";
import { FillBlank } from "./FillBlank";
import { MultipleChoice } from "./MultipleChoice";
import { WordOrder } from "./WordOrder";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ExerciseBlock({
  ex,
  onResult,
}: {
  ex: GrammarExercise;
  onResult: (correct: boolean) => void;
}) {
  switch (ex.type) {
    case "fillBlank":
      return <FillBlank exercise={ex} onResult={onResult} />;
    case "multipleChoice":
      return <MultipleChoice exercise={ex} onResult={onResult} />;
    case "wordOrder":
      return <WordOrder exercise={ex} onResult={onResult} />;
    default:
      return null;
  }
}

export function LessonView({ lesson }: { lesson: GrammarLesson }) {
  const recordLessonComplete = useAppStore((s) => s.recordLessonComplete);
  const [scores, setScores] = useState<boolean[]>(() =>
    lesson.exercises.map(() => false),
  );
  const [recorded, setRecorded] = useState(false);

  const total = lesson.exercises.length;
  const correctCount = useMemo(() => scores.filter(Boolean).length, [scores]);

  const setScore = (idx: number, ok: boolean) => {
    setScores((prev) => {
      const next = [...prev];
      next[idx] = ok;
      return next;
    });
  };

  const finish = () => {
    if (recorded) return;
    recordLessonComplete(lesson.id, correctCount, total);
    setRecorded(true);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {lesson.sections.map((sec) => (
        <section key={sec.heading} className="space-y-4">
          <h2 className="text-xl font-semibold">{sec.heading}</h2>
          {sec.body.map((p, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
          {sec.examples && (
            <ul className="space-y-2 border-l-2 border-destructive/50 pl-4">
              {sec.examples.map((ex) => (
                <li key={ex.de}>
                  <span className="font-medium text-foreground">{ex.de}</span>
                  <span className="text-muted-foreground"> — {ex.en}</span>
                </li>
              ))}
            </ul>
          )}
          {sec.table && (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                {sec.table.headers && (
                  <thead>
                    <tr className="border-b bg-muted/50">
                      {sec.table.headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {sec.table.rows.map((row, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      {row.cells.map((c, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}

      <Separator />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Exercises</h2>
        {lesson.exercises.map((ex, idx) => (
          <Card key={ex.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exercise {idx + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExerciseBlock ex={ex} onResult={(ok) => setScore(idx, ok)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pb-8">
        <p className="text-sm text-muted-foreground">
          Score: {correctCount} / {total}
        </p>
        <Button type="button" onClick={finish} disabled={recorded}>
          {recorded ? "Progress saved" : "Save lesson progress"}
        </Button>
      </div>
    </div>
  );
}
