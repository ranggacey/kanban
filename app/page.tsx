import Link from "next/link";
import { Logo, Button } from "@/components/ui";

/** Decorative, non-interactive kanban mock for the hero. */
function HeroBoard() {
  const cols = [
    {
      title: "Rencana",
      cards: [
        { t: "Riset kompetitor", c: "#E3EBF1" },
        { t: "Wireframe halaman utama", c: "#E9EFE2" },
      ],
    },
    {
      title: "Dikerjakan",
      cards: [{ t: "Desain sistem warna", c: "#F4ECDA" }],
    },
    {
      title: "Selesai",
      cards: [
        { t: "Setup proyek Next.js", c: "#E9EFE2" },
        { t: "Skema database", c: "#E3EBF1" },
      ],
    },
  ];
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative rounded-3xl border border-line bg-surface/80 p-4 shadow-lift backdrop-blur-sm animate-float-slow"
    >
      <div className="flex gap-3 overflow-hidden">
        {cols.map((col) => (
          <div
            key={col.title}
            className="w-44 shrink-0 rounded-2xl bg-cream/80 p-2.5"
          >
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted">
              {col.title}
            </p>
            <div className="space-y-2">
              {col.cards.map((card) => (
                <div
                  key={card.t}
                  className="rounded-xl border border-line/60 bg-surface px-3 py-2.5 text-[13px] font-medium text-ink shadow-warm"
                >
                  <span
                    className="mb-1.5 block h-1.5 w-8 rounded-full"
                    style={{ backgroundColor: card.c }}
                  />
                  {card.t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-3xl bg-gradient-to-t from-surface to-transparent" />
    </div>
  );
}

const features = [
  {
    icon: "/icons/icon-drag.png",
    title: "Drag & drop yang halus",
    desc: "Geser kartu antar kolom dengan animasi lembut. Urutan tersimpan otomatis ke database.",
  },
  {
    icon: "/icons/icon-realtime.png",
    title: "Realtime bawaan",
    desc: "Buka papan yang sama di dua tab — perubahan muncul seketika tanpa refresh.",
  },
  {
    icon: "/icons/icon-label.png",
    title: "Label & tenggat",
    desc: "Beri label warna, deskripsi, dan tanggal tenggat supaya tidak ada yang terlewat.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-full overflow-hidden">
      {/* soft ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sage-soft blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-dusty-soft blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gold-soft blur-3xl"
      />

      {/* nav */}
      <header className="relative z-10 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/login?mode=daftar">
            <Button size="sm">Daftar gratis</Button>
          </Link>
        </div>
      </header>

      {/* hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-sage-dark">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
              </span>
              Papan Kanban realtime
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-6xl">
              Kerja jadi
              <br />
              lebih <span className="italic text-sage-dark">tenang</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Geser adalah papan Kanban yang kalem dan elegan. Atur tugas
              dengan drag-and-drop, pantau progres sekilas, dan biarkan
              perubahan tersinkron otomatis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login?mode=daftar">
                <Button>Mulai gratis</Button>
              </Link>
              <Link href="/login">
                <Button variant="soft">Saya sudah punya akun</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Gratis • Tanpa kartu kredit • Data tersimpan aman
            </p>
          </div>
          <div className="animate-fade-up [animation-delay:150ms]">
            <HeroBoard />
          </div>
        </section>

        {/* features */}
        <section className="pb-20">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Dibuat dengan penuh ketelitian
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Setiap detail dirancang supaya memakai aplikasinya terasa ringan
            dan menyenangkan.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-surface p-6 shadow-warm transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center">
                  <img
                    src={f.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-14 w-14 object-contain transition-transform duration-300 hover:rotate-6 hover:scale-110"
                  />
                </div>
                <h3 className="font-display text-xl font-medium text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-line/70 py-8">
        <p className="text-center text-sm text-muted">
          Create by{" "}
          <a
            href="https://github.com/ranggacey"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-sage-dark"
          >
            ranggacey
          </a>
        </p>
      </footer>
    </div>
  );
}
