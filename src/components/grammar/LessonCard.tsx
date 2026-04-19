"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GrammarLesson } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

export function LessonCard({ lesson }: { lesson: GrammarLesson }) {
  const done = useAppStore((s) => s.grammarProgress[lesson.id]?.completed);

  return (
    <Link href={`/grammar/${lesson.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
            {done ? (
              <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-label="Completed" />
            ) : (
              <Badge variant="outline">{lesson.level}</Badge>
            )}
          </div>
          <CardDescription className="line-clamp-2">{lesson.summary}</CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {lesson.exercises.length} exercises
        </CardContent>
      </Card>
    </Link>
  );
}
