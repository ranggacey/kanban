export default function BoardsLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat daftar papan">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="h-10 w-48 animate-pulse rounded-xl bg-line/70" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-line/50" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-xl bg-line/70" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <div className="h-6 w-2/3 animate-pulse rounded-lg bg-line/70" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-lg bg-line/50" />
            <div className="mt-1.5 h-4 w-1/2 animate-pulse rounded-lg bg-line/50" />
            <div className="mt-6 h-8 w-full animate-pulse rounded-lg bg-line/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
