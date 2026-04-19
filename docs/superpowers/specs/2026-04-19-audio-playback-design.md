# Audio Playback for Vocabulary Cards and Grammar Exercises

**Date:** 2026-04-19
**Status:** Approved (expanded scope)

## Overview

Add audio playback throughout the app so learners can hear correct German pronunciation of words, example sentences, and grammar examples. Uses the browser's built-in Web Speech API — no backend, no API key, no bundled audio files required.

## Decisions Made

| Question | Decision |
|---|---|
| Audio source | Web Speech API (`window.speechSynthesis`) |
| Vocab card — what is spoken | Separate buttons — word on front face, example sentence on back face |
| Button placement on card | Speaker icon at bottom-center of each card face |
| Auto-play trigger | Manual tap by default; settings toggle enables auto-play |
| Auto-play sequence | Word spoken when card loads; example sentence spoken when card flips to back |
| Grammar audio | Speaker icon next to each German example in lesson sections and exercise feedback |
| Voice selection | Dropdown in settings — lists available `de-*` voices from the browser |
| Playback speed | Three presets in settings: Slow (0.7), Normal (0.9), Fast (1.1) |

## Files Changed

| File | Change |
|---|---|
| `src/lib/types.ts` | Add `autoPlayAudio`, `audioRate`, `audioVoiceURI` to `UserSettings` |
| `src/lib/store.ts` | Add defaults for new settings fields |
| `src/lib/useAudio.ts` | New hook — wraps `window.speechSynthesis`, reads rate/voice from store |
| `src/components/ui/AudioButton.tsx` | New reusable speaker icon button component |
| `src/components/vocabulary/FlashCard.tsx` | Add `AudioButton` on each card face |
| `src/components/vocabulary/StudySession.tsx` | Auto-play word on card load and sentence on flip |
| `src/components/grammar/LessonView.tsx` | Add `AudioButton` next to each German example |
| `src/components/grammar/FillBlank.tsx` | Add `AudioButton` next to correct answer in feedback |
| `src/components/grammar/MultipleChoice.tsx` | Add `AudioButton` next to each option |
| `src/components/grammar/WordOrder.tsx` | Add `AudioButton` next to correct sentence in feedback |
| `src/components/settings/GoalSettings.tsx` | Add audio section: auto-play toggle, speed presets, voice dropdown |

## Data Model

Add three fields to `UserSettings` in `src/lib/types.ts`:

```ts
export interface UserSettings {
  dailyCardGoal: number;
  dailyLessonGoal: number;
  theme: "light" | "dark" | "system";
  autoPlayAudio: boolean;       // new — default: false
  audioRate: number;            // new — default: 0.9 (Slow: 0.7, Normal: 0.9, Fast: 1.1)
  audioVoiceURI: string | null; // new — default: null (OS default voice)
}
```

In `src/lib/store.ts`, update `defaultSettings`:

```ts
const defaultSettings: UserSettings = {
  dailyCardGoal: 10,
  dailyLessonGoal: 1,
  theme: "system",
  autoPlayAudio: false,
  audioRate: 0.9,
  audioVoiceURI: null,
};
```

No other store changes needed — `setSettings` already accepts `Partial<UserSettings>`.

## `useAudio` Hook

New file: `src/lib/useAudio.ts`

Wraps `window.speechSynthesis`. Reads `audioRate` and `audioVoiceURI` from the store so all call sites automatically respect the user's settings.

```ts
export function useAudio() {
  const audioRate = useAppStore((s) => s.settings.audioRate);
  const audioVoiceURI = useAppStore((s) => s.settings.audioVoiceURI);

  const speak = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = audioRate;
    if (audioVoiceURI) {
      const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === audioVoiceURI);
      if (voice) utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  }, [audioRate, audioVoiceURI]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  return { speak, stop };
}
```

Key decisions:
- `cancel()` before each `speak()` — prevents utterances queuing on repeated taps
- Falls back to OS default voice gracefully if the stored voice URI is no longer available
- Cleanup on unmount — no speech bleed-over after navigating away

## `AudioButton` Component

New file: `src/components/ui/AudioButton.tsx`

A small reusable button used wherever a German text needs a speaker icon. Keeps the icon consistent across vocab cards and grammar components.

```tsx
export function AudioButton({ text }: { text: string }) {
  const { speak } = useAudio();
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label="Play audio"
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      <Volume2 size={16} />
    </button>
  );
}
```

- `e.stopPropagation()` — prevents click bubbling (important inside the flippable `FlashCard`)
- Used inline next to German text throughout the app

## `FlashCard` Changes

`AudioButton` is added at bottom-center of each card face:

- Front face: `<AudioButton text={card.german} />`
- Back face: `<AudioButton text={card.example} />`

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

Existing Space-to-flip keyboard shortcut is unaffected.

## Auto-play in `StudySession`

Two `useEffect`s — one for word on card load, one for sentence on flip:

```ts
const autoPlayAudio = useAppStore((s) => s.settings.autoPlayAudio);
const { speak, stop } = useAudio();

// Speak word when a new card appears
useEffect(() => {
  if (autoPlayAudio && card) speak(card.german);
  return () => stop();
}, [index]);

// Speak example sentence when card is flipped to back
useEffect(() => {
  if (autoPlayAudio && flipped && card) speak(card.example);
}, [flipped]);
```

- Only activates when `autoPlayAudio` is `true` (default `false`)
- Clean separation: word on load, sentence on flip
- Cleanup cancels in-progress speech on card advance — no bleed-over

## Grammar Audio

### `LessonView` — Example sentences

A `AudioButton` is added inline next to each German example sentence in lesson sections:

```tsx
{sec.examples.map((ex) => (
  <li key={ex.de} className="flex items-center gap-2">
    <span className="font-medium text-foreground">{ex.de}</span>
    <AudioButton text={ex.de} />
    <span className="text-muted-foreground"> — {ex.en}</span>
  </li>
))}
```

### `FillBlank` — Correct answer feedback

Speaker icon next to the correct answer when an incorrect answer is submitted:

```tsx
{correct ? "Correct!" : (
  <span className="flex items-center gap-2">
    Expected: {exercise.answer} <AudioButton text={exercise.answer} />
  </span>
)}
```

### `MultipleChoice` — Options

Speaker icon next to each option button so learners can hear the choices:

```tsx
<Button ...>
  <span className="flex items-center gap-2 w-full">
    {opt} <AudioButton text={opt} />
  </span>
</Button>
```

### `WordOrder` — Correct sentence feedback

Speaker icon next to the correct sentence when shown after submission:

```tsx
{correct ? "Correct!" : (
  <span className="flex items-center gap-2">
    Expected: {exercise.correctOrder.join(" ")}
    <AudioButton text={exercise.correctOrder.join(" ")} />
  </span>
)}
```

## Settings UI

New "Audio" section in `src/components/settings/GoalSettings.tsx`:

```
─────────────────────────────────────────
Audio

Auto-play German word and sentence
[ toggle ]  Automatically speak the word when a card loads,
            and the example sentence when you flip it.

Playback speed
[ Slow ]  [ Normal ]  [ Fast ]

Voice
[ dropdown — lists available de-* voices ]
```

- **Auto-play toggle:** `<input type="checkbox">` — calls `setSettings({ autoPlayAudio })`
- **Speed presets:** Three buttons (Slow/Normal/Fast), active state highlighted — calls `setSettings({ audioRate: 0.7 | 0.9 | 1.1 })`
- **Voice dropdown:** `<select>` populated from `window.speechSynthesis.getVoices()` filtered to `lang.startsWith("de")`. Falls back gracefully if no German voices are found. Calls `setSettings({ audioVoiceURI: voice.voiceURI })`.
  - Voices load asynchronously on Chrome — the component listens for the `voiceschanged` event using a `useEffect`.
  - If the browser exposes no German voices, the dropdown is hidden and a note says "Using OS default voice."

## Out of Scope

- Keyboard shortcut to trigger audio
- Audio for grammar table cells
