import { notFound } from "next/navigation";
import Link from "next/link";
import { LessonView } from "@/components/grammar/LessonView";
import { getLessonById } from "@/content/catalog";
import { Button } from "@/components/ui/button";

export default async function GrammarLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/grammar">← Lessons</Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.summary}</p>
      </div>
      <LessonView lesson={lesson} />
    </div>
  );
}
