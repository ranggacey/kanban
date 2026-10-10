import { Logo } from "@/components/ui";

export default function RootLoading() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <Logo className="text-4xl" />
        <div className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-sage"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted">Menyiapkan papan…</p>
      </div>
    </div>
  );
}
