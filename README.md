# Geser — Papan Kanban Realtime

Geser (dari kata Indonesia "menggeser") adalah aplikasi papan Kanban ala Trello
dengan sinkronisasi **realtime**: buka papan yang sama di dua tab, geser kartu
di satu tab, dan perubahan langsung muncul di tab satunya — tanpa refresh.

Dibangun sebagai proyek portofolio dengan estetika yang tenang dan lembut,
terinspirasi anime *Frieren* (palet sage green, cream hangat, dusty blue).

## ✨ Fitur

- **Autentikasi** — daftar & masuk dengan email + kata sandi (Supabase Auth)
- **Banyak papan** — buat, buka, dan hapus papan kerja milikmu
- **Kolom fleksibel** — tambah, ubah nama (klik ikon ✎), hapus, dan susun ulang
  kolom dengan drag-and-drop
- **Kartu** — tambah, ubah, hapus; drag-and-drop antar kolom maupun di dalam
  kolom yang sama (optimistic UI, posisi tersimpan ke database)
- **Detail kartu** — deskripsi, label warna, dan tanggal tenggat (dengan penanda
  "lewat" otomatis)
- **Realtime** — subscribe ke perubahan `boards`, `columns`, `cards` via
  Supabase Realtime; indikator "Live" saat terhubung
- **Keamanan** — Row Level Security: tiap user hanya bisa akses datanya sendiri

## 🛠️ Tech stack

| Lapisan   | Teknologi                                   |
|-----------|---------------------------------------------|
| Framework | Next.js 16 (App Router), TypeScript, React 19 |
| Styling   | Tailwind CSS v4, next/font (Fraunces + Plus Jakarta Sans) |
| Database  | Supabase (PostgreSQL + Row Level Security)  |
| Auth      | Supabase Auth (email/password, via @supabase/ssr) |
| Realtime  | Supabase Realtime (`postgres_changes`)      |
| Drag & drop | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| Deploy    | Vercel                                      |

## 🚀 Cara menjalankan lokal

### 1. Siapkan database Supabase

1. Buat project gratis di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → **New query**
3. Copy-paste seluruh isi `supabase/schema.sql` → **Run**

   File ini membuat tabel `boards`, `columns`, `cards`, mengaktifkan RLS +
   policy per-user, memberikan grant ke role `authenticated`, dan
   mendaftarkan ketiga tabel ke publication `supabase_realtime`.

> Catatan: di **Project Settings → API**, untuk "Data API", centang
> **Enable Data API** dan **Enable automatic RLS**, tapi biarkan
> **Automatically expose new tables** tidak dicentang (akses sudah diatur
> manual di `schema.sql`).

### 2. Isi environment variables

Buat file `.env.local` di root project dengan isi berikut:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_dengan_anon_key_anda
```

Lalu isi nilainya dari **Supabase Dashboard → Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL (`https://xxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` / `publishable` key

> Pakai **anon key saja**. Jangan pernah memakai `service_role` / secret key
> di aplikasi ini — RLS sudah cukup untuk melindungi data.

### 3. Install & jalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) → daftar akun → buat papan.

## ☁️ Deploy ke Vercel

1. Push repo ini ke GitHub (**jangan** sertakan `.env.local`)
2. Di [vercel.com](https://vercel.com) → **Add New Project** → import repo
3. Di **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** — selesai 🎉

## 🗂️ Struktur proyek

```
geser/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Masuk / daftar (Supabase Auth)
│   ├── boards/
│   │   ├── layout.tsx        # Navbar + proteksi login
│   │   ├── page.tsx          # Daftar papan (Server Component)
│   │   └── [id]/page.tsx     # Halaman papan (verifikasi owner)
│   └── globals.css           # Tema Tailwind v4 (palet Frieren)
├── components/
│   ├── kanban-board.tsx      # DndContext, state, realtime, header
│   ├── kanban-column.tsx     # Kolom sortable + tambah kartu
│   ├── kanban-card.tsx       # Kartu sortable + label & tenggat
│   ├── card-modal.tsx        # Modal detail kartu
│   ├── board-list.tsx        # Grid daftar papan + buat/hapus
│   ├── navbar.tsx            # Navigasi + keluar
│   └── ui.tsx                # Primitif UI (Button, Input, Modal…)
├── lib/
│   ├── types.ts              # Tipe baris database
│   ├── labels.ts             # Palet warna label
│   ├── utils.ts              # Helper kecil
│   └── supabase/
│       ├── client.ts         # Browser client (@supabase/ssr)
│       ├── server.ts         # Server client (cookies async)
│       └── proxy.ts          # Refresh sesi + guard route
├── proxy.ts                  # Proteksi /boards/* (konvensi Next.js 16)
└── supabase/
    └── schema.sql            # Migrasi database (JANGAN diubah)
```

## 📝 Catatan pengembangan

- Kredensial hanya dibaca dari environment variables — tidak ada API key
  yang tertulis di kode, docs, atau contoh env.
- Semua query memakai *authenticated client* sehingga policy RLS berlaku;
  tidak ada penggunaan service role key di mana pun.
- Optimistic UI untuk drag-and-drop: state lokal langsung diupdate, lalu
  posisi (`position` + `column_id`) dipersist ke database; jika gagal,
  state di-refetch dari server.
