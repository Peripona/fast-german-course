import { notFound } from "next/navigation";
import Link from "next/link";
import { StudySession } from "@/components/vocabulary/StudySession";
import { getDeckById } from "@/content/catalog";
import { Button } from "@/components/ui/button";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const deck = getDeckById(deckId);
  if (!deck) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vocabulary">← Decks</Link>
        </Button>
      </div>
      <h1 className="text-xl font-semibold">{deck.title}</h1>
      <StudySession cards={deck.cards} title={deck.title} finishHref="/vocabulary" />
    </div>
  );
}
