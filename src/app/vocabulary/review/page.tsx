import Link from "next/link";
import { ReviewSession } from "@/components/vocabulary/ReviewSession";
import { Button } from "@/components/ui/button";

export default function ReviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vocabulary">← Decks</Link>
        </Button>
      </div>
      <h1 className="text-xl font-semibold">Due for review</h1>
      <ReviewSession />
    </div>
  );
}
