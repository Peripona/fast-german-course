import { LessonCard } from "@/components/grammar/LessonCard";
import { grammarLessons } from "@/content/catalog";

export default function GrammarPage() {
  const byLevel = grammarLessons.reduce(
    (acc, l) => {
      acc[l.level] = acc[l.level] ?? [];
      acc[l.level].push(l);
      return acc;
    },
    {} as Record<string, typeof grammarLessons>,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grammar</h1>
        <p className="text-muted-foreground">
          Read explanations and complete exercises. Save progress when finished.
        </p>
      </div>
      {Object.entries(byLevel).map(([level, lessons]) => (
        <section key={level} className="space-y-4">
          <h2 className="text-lg font-semibold">{level}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
