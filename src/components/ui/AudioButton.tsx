"use client";

import { Volume2 } from "lucide-react";
import { useAudio } from "@/lib/useAudio";

export function AudioButton({ text }: { text: string }) {
  const { speak } = useAudio();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      aria-label="Play audio"
      className="inline-flex shrink-0 items-center text-muted-foreground transition-colors hover:text-foreground"
    >
      <Volume2 size={16} />
    </button>
  );
}
