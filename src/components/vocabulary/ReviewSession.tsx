"use client";

import { useMemo } from "react";
import { getAllCardIds, vocabDecks } from "@/content/catalog";
import { getDueCardIds } from "@/lib/store";
import { useAppStore } from "@/lib/store";
import type { VocabCard } from "@/lib/types";
import { StudySession } from "./StudySession";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ReviewSession() {
  const vocabProgress = useAppStore((s) => s.vocabProgress);

  const dueCards: VocabCard[] = useMemo(() => {
    const ids = getDueCardIds(getAllCardIds(), vocabProgress);
    const map = new Map(
      vocabDecks.flatMap((d) => d.cards).map((c) => [c.id, c]),
    );
    return ids.map((id) => map.get(id)).filter((c): c is VocabCard => Boolean(c));
  }, [vocabProgress]);

  if (dueCards.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No cards due for review. Great job!</p>
        <Button asChild variant="outline">
          <Link href="/vocabulary">Browse decks</Link>
        </Button>
      </div>
    );
  }

  return (
    <StudySession cards={dueCards} title="Review queue" finishHref="/vocabulary" />
  );
}
