"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { AppState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function buildExportPayload(s: ReturnType<typeof useAppStore.getState>) {
  return {
    vocabProgress: s.vocabProgress,
    grammarProgress: s.grammarProgress,
    dailyStats: s.dailyStats,
    settings: s.settings,
    lastActiveDate: s.lastActiveDate,
    streak: s.streak,
  };
}

export function DataExport() {
  const importState = useAppStore((s) => s.importState);
  const [text, setText] = useState("");

  const download = () => {
    const exportPayload = buildExportPayload(useAppStore.getState());
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `german-tutor-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const load = () => {
    try {
      const data = JSON.parse(text) as Partial<AppState>;
      importState(data);
      setText("");
      alert("Import successful. Reload if UI looks stale.");
    } catch {
      alert("Invalid JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={download}>
          Download JSON backup
        </Button>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="import-json">
          Paste backup JSON to restore
        </label>
        <Textarea
          id="import-json"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="{}"
          className="min-h-[120px] font-mono text-xs"
        />
        <Button type="button" variant="secondary" onClick={load} disabled={!text.trim()}>
          Import
        </Button>
      </div>
    </div>
  );
}
