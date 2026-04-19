# Audio Playback for Vocabulary Cards

**Date:** 2026-04-19
**Status:** Approved

## Overview

Add audio playback to vocabulary flashcards so learners can hear correct German pronunciation of words and example sentences. Uses the browser's built-in Web Speech API — no backend, no API key, no bundled audio files required.

## Decisions Made

| Question | Decision |
|---|---|
| Audio source | Web Speech API (`window.speechSynthesis`) |
| What is spoken | Separate buttons — word on front face, example sentence on back face |
| Button placement | Speaker icon at bottom-center of each card face |
| Trigger | Manual tap by default; auto-play toggle available in settings |

## Files Changed

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `autoPlayAudio: boolean` to `UserSettings` |
| `src/lib/store.ts` | Add `autoPlayAudio: false` to `defaultSettings` |
| `src/lib/useAudio.ts` | New hook — wraps `window.speechSynthesis` |
| `src/components/vocabulary/FlashCard.tsx` | Add speaker icons on each card face |
| `src/components/vocabulary/StudySession.tsx` | Auto-play effect when setting is enabled |
| `src/components/settings/GoalSettings.tsx` | Add audio toggle UI |

## Data Model

Add one field to `UserSettings` in `src/lib/types.ts`:

```ts
export interface UserSettings {
  dailyCardGoal: number;
  dailyLessonGoal: number;
  theme: "light" | "dark" | "system";
  autoPlayAudio: boolean;   // new — default: false
}
```

In `src/lib/store.ts`, update `defaultSettings`:

```ts
const defaultSettings: UserSettings = {
  dailyCardGoal: 10,
  dailyLessonGoal: 1,
  theme: "system",
  autoPlayAudio: false,
};
```

No other store changes needed — `setSettings` already accepts `Partial<UserSettings>`.

## `useAudio` Hook

New file: `src/lib/useAudio.ts`

```ts
import { useCallback, useEffect } from "react";

export function useAudio() {
  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return { speak, stop };
}
```

- `lang: "de-DE"` — German pronunciation regardless of OS language
- `rate: 0.9` — slightly slower for learner clarity
- `cancel()` before each `speak()` — prevents utterances queuing on repeated taps
- Cleanup on unmount — no speech bleed-over after navigating away

## `FlashCard` Changes

Both card faces get a `Volume2` icon button (from `lucide-react`) at the bottom-center.

- Front face button: calls `speak(card.german)`
- Back face button: calls `speak(card.example)`
- Both buttons call `e.stopPropagation()` to prevent the click from also flipping the card
- Buttons are visually subtle (`text-muted-foreground`, small size) — they don't compete with card content
- Existing Space-to-flip keyboard shortcut is unaffected

Card layout with audio button:

```
┌──────────────────────────────┐
│                              │
│     Hallo          (front)   │
│     greeting                 │
│                              │
│          [🔊]                │  speaks card.german
└──────────────────────────────┘

┌──────────────────────────────┐
│                              │
│     Hello          (back)    │
│     Hallo, wie geht es dir?  │
│     Hello, how are you?      │
│                              │
│          [🔊]                │  speaks card.example
└──────────────────────────────┘
```

## Auto-play in `StudySession`

```ts
const autoPlayAudio = useAppStore((s) => s.settings.autoPlayAudio);
const { speak, stop } = useAudio();

useEffect(() => {
  if (autoPlayAudio && card) {
    speak(card.german);
  }
  return () => stop();
}, [index]);
```

- Only fires when `autoPlayAudio` is `true` (default `false`)
- Speaks `card.german` — the word on the front face
- Cleanup cancels in-progress speech when the card advances — no bleed-over between cards
- Manual speaker icons in `FlashCard` work independently regardless of this setting

## Settings UI

New section added to `src/components/settings/GoalSettings.tsx` below the existing goal inputs:

```
─────────────────────────
Audio

Auto-play German word
Automatically speak each word when a new card appears.
[ toggle ]
```

- Native `<input type="checkbox">` — no new dependencies
- Reads `settings.autoPlayAudio` from the store
- Calls `setSettings({ autoPlayAudio: !settings.autoPlayAudio })` on change

## Out of Scope

- Auto-play of example sentences (only the word is auto-played)
- Audio for grammar exercises
- Voice selection UI (uses OS default German voice)
- Playback speed control
