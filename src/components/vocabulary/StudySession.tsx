"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Rating, VocabCard } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useAudio } from "@/lib/useAudio";
import { FlashCard } from "./FlashCard";
import { RatingButtons } from "./RatingButtons";
import { Button } from "@/components/ui/button";

const keyToRating: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

export function StudySession({
  cards,
  title,
  finishHref = "/vocabulary",
}: {
  cards: VocabCard[];
  title: string;
  finishHref?: string;
}) {
  const router = useRouter();
  const recordCardReview = useAppStore((s) => s.recordCardReview);
  const autoPlayAudio = useAppStore((s) => s.settings.autoPlayAudio);
  const { speak, stop } = useAudio();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const done = index >= cards.length;

  const onRate = useCallback(
    (r: Rating) => {
      if (!flipped || !card) return;
      recordCardReview(card.id, r);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [card, flipped, recordCardReview],
  );

  useEffect(() => {
    setFlipped(false);
  }, [index]);

  // Auto-play German word when a new card appears
  useEffect(() => {
    if (autoPlayAudio && card) speak(card.german);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Auto-play example sentence when card flips to back
  useEffect(() => {
    if (autoPlayAudio && flipped && card) speak(card.example);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (done) return;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped && keyToRating[e.key]) {
        e.preventDefault();
        onRate(keyToRating[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [done, flipped, onRate]);

  if (cards.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No cards in this session.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push(finishHref)}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-2xl font-semibold">Session complete</h2>
        <p className="text-muted-foreground">
          You reviewed {cards.length} card{cards.length === 1 ? "" : "s"} in {title}.
        </p>
        <Button onClick={() => router.push(finishHref)}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{title}</span>
        <span>
          {index + 1} / {cards.length}
        </span>
      </div>
      <FlashCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
      <div className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          {flipped ? "How well did you remember?" : "Flip the card, then rate."}
        </p>
        <div className={!flipped ? "pointer-events-none opacity-40" : ""}>
          <RatingButtons onRate={onRate} />
        </div>
      </div>
    </div>
  );
}
