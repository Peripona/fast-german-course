import type { GrammarLesson, VocabDeck } from "@/lib/types";

import deckBasics from "./vocabulary/a1-basics.json";
import deckColors from "./vocabulary/a1-colors.json";
import deckDaily from "./vocabulary/a1-daily-routines.json";
import deckDirections from "./vocabulary/a1-directions.json";
import deckFamily from "./vocabulary/a1-family.json";
import deckFood from "./vocabulary/a1-food.json";
import deckGreetings from "./vocabulary/a1-greetings.json";
import deckNumbers from "./vocabulary/a1-numbers.json";

import grammarArticles from "./grammar/a1-articles.json";
import grammarNegation from "./grammar/a1-negation.json";
import grammarPronouns from "./grammar/a1-personal-pronouns.json";
import grammarPresent from "./grammar/a1-present-tense.json";
import grammarSeinHaben from "./grammar/a1-sein-haben.json";
import grammarWordOrder from "./grammar/a1-word-order.json";

export const vocabDecks: VocabDeck[] = [
  deckGreetings as VocabDeck,
  deckNumbers as VocabDeck,
  deckColors as VocabDeck,
  deckFamily as VocabDeck,
  deckFood as VocabDeck,
  deckDirections as VocabDeck,
  deckDaily as VocabDeck,
  deckBasics as VocabDeck,
];

export const grammarLessons: GrammarLesson[] = [
  grammarArticles as GrammarLesson,
  grammarPronouns as GrammarLesson,
  grammarPresent as GrammarLesson,
  grammarSeinHaben as GrammarLesson,
  grammarNegation as GrammarLesson,
  grammarWordOrder as GrammarLesson,
];

export function getDeckById(id: string): VocabDeck | undefined {
  return vocabDecks.find((d) => d.id === id);
}

export function getAllCardIds(): string[] {
  return vocabDecks.flatMap((d) => d.cards.map((c) => c.id));
}

export function getLessonById(id: string): GrammarLesson | undefined {
  return grammarLessons.find((l) => l.id === id);
}
