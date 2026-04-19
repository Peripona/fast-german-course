"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function GoalSettings() {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  return (
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
  );
}
