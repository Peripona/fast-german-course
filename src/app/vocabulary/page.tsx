import Link from "next/link";
import { DeckCard } from "@/components/vocabulary/DeckCard";
import { Button } from "@/components/ui/button";
import { vocabDecks } from "@/content/catalog";

export default function VocabularyPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vocabulary</h1>
          <p className="text-muted-foreground">
            Study themed decks. Flip cards and rate recall to schedule reviews.
          </p>
        </div>
        <Button asChild>
          <Link href="/vocabulary/review">Review due cards</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vocabDecks.map((deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    </div>
  );
}
