"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SPEED_PRESETS = [
  { label: "Slow", rate: 0.7 },
  { label: "Normal", rate: 0.9 },
  { label: "Fast", rate: 1.1 },
];

export function GoalSettings() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    function loadVoices() {
      const all = window.speechSynthesis.getVoices();
      setVoices(all.filter((v) => v.lang.startsWith("de")));
    }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Goal settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="card-goal">Daily card review goal</Label>
          <div className="flex gap-2">
            <input
              id="card-goal"
              type="number"
              min={1}
              max={200}
              className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
              value={settings.dailyCardGoal}
              onChange={(e) =>
                setSettings({ dailyCardGoal: Number(e.target.value) || 1 })
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSettings({ dailyCardGoal: 10 })}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lesson-goal">Daily new grammar lessons goal</Label>
          <div className="flex gap-2">
            <input
              id="lesson-goal"
              type="number"
              min={0}
              max={20}
              className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
              value={settings.dailyLessonGoal}
              onChange={(e) =>
                setSettings({ dailyLessonGoal: Number(e.target.value) || 0 })
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSettings({ dailyLessonGoal: 1 })}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Audio settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Audio</h3>

        {/* Auto-play toggle */}
        <div className="flex items-start gap-3">
          <input
            id="auto-play"
            type="checkbox"
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-input accent-primary"
            checked={settings.autoPlayAudio}
            onChange={(e) => setSettings({ autoPlayAudio: e.target.checked })}
          />
          <div>
            <Label htmlFor="auto-play" className="cursor-pointer font-medium">
              Auto-play German word and sentence
            </Label>
            <p className="text-xs text-muted-foreground">
              Automatically speak the word when a card loads and the example sentence when you flip it.
            </p>
          </div>
        </div>

        {/* Playback speed */}
        <div className="space-y-2">
          <Label>Playback speed</Label>
          <div className="flex gap-2">
            {SPEED_PRESETS.map(({ label, rate }) => (
              <Button
                key={label}
                type="button"
                size="sm"
                variant={settings.audioRate === rate ? "default" : "outline"}
                onClick={() => setSettings({ audioRate: rate })}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Voice selection */}
        {voices.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <select
              id="voice-select"
              className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              value={settings.audioVoiceURI ?? ""}
              onChange={(e) =>
                setSettings({ audioVoiceURI: e.target.value || null })
              }
            >
              <option value="">OS default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Using OS default German voice.</p>
        )}
      </div>
    </div>
  );
}
