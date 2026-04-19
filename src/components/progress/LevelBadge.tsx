import type { CEFRLevel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function LevelBadge({ level }: { level: CEFRLevel }) {
  return (
    <Badge className="px-4 py-1 text-lg font-bold" variant="secondary">
      {level}
    </Badge>
  );
}
