"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { VocabDeck } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { isDue } from "@/lib/srs";

export function DeckCard({ deck }: { deck: VocabDeck }) {
  const vocabProgress = useAppStore((s) => s.vocabProgress);
  const total = deck.cards.length;
  const learned = deck.cards.filter(
    (c) => vocabProgress[c.id] && vocabProgress[c.id]!.repetitions >= 1,
  ).length;
  const due = deck.cards.filter((c) => isDue(vocabProgress[c.id])).length;
  const pct = total ? Math.round((learned / total) * 100) : 0;

  return (
    <Link href={`/vocabulary/${deck.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{deck.title}</CardTitle>
            <Badge variant="outline">{deck.level}</Badge>
          </div>
          <CardDescription>{deck.topic}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{learned}/{total} seen</span>
            <span>{due} due</span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>
    </Link>
  );
}
