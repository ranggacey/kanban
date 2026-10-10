export default function BoardLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat papan" className="-mx-4 -mt-8 sm:-mx-6">
      <div className="border-b border-line/70 bg-surface/60 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="h-8 w-24 animate-pulse rounded-lg bg-line/70" />
          <div className="h-8 w-56 animate-pulse rounded-xl bg-line/70" />
        </div>
      </div>
      <div className="overflow-x-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-start gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-72 shrink-0 rounded-2xl border border-line bg-surface/70 p-3"
            >
              <div className="mb-3 h-5 w-24 animate-pulse rounded-lg bg-line/70" />
              <div className="space-y-2.5">
                {[0, 1].map((j) => (
                  <div
                    key={j}
                    className="h-20 animate-pulse rounded-xl bg-line/40"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
