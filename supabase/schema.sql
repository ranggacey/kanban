-- ============================================================
-- Geser — Kanban board realtime
-- Cara pakai: Supabase Dashboard → SQL Editor → New query
--             → copy-paste seluruh file ini → Run
-- Project : kanban (zbplntzmzcymgfzshosx)
-- ============================================================

-- 1. Tabel boards (papan kerja milik user)
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel columns (kolom dalam board: To Do, In Progress, Done, ...)
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Tabel cards (kartu kerjaan dalam kolom)
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null,
  description text,
  labels text[] not null default '{}',
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Index untuk performa query
create index if not exists idx_boards_user_id on public.boards(user_id);
create index if not exists idx_columns_board_id on public.columns(board_id);
create index if not exists idx_cards_board_id on public.cards(board_id);
create index if not exists idx_cards_column_id on public.cards(column_id);

-- 5. Aktifkan Row Level Security di semua tabel
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

-- 6. Policy: user hanya bisa akses datanya sendiri
drop policy if exists "Users manage own boards" on public.boards;
create policy "Users manage own boards"
  on public.boards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage columns of own boards" on public.columns;
create policy "Users manage columns of own boards"
  on public.columns for all
  using (exists (
    select 1 from public.boards
    where boards.id = columns.board_id
      and boards.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.boards
    where boards.id = columns.board_id
      and boards.user_id = auth.uid()
  ));

drop policy if exists "Users manage cards of own boards" on public.cards;
create policy "Users manage cards of own boards"
  on public.cards for all
  using (exists (
    select 1 from public.boards
    where boards.id = cards.board_id
      and boards.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.boards
    where boards.id = cards.board_id
      and boards.user_id = auth.uid()
  ));

-- 7. Grant akses ke role authenticated
--    (perlu karena "Automatically expose new tables" dimatikan)
grant select, insert, update, delete on public.boards to authenticated;
grant select, insert, update, delete on public.columns to authenticated;
grant select, insert, update, delete on public.cards to authenticated;

-- 8. Aktifkan Realtime (supabase_realtime publication) untuk ketiga tabel
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'boards'
  ) then
    alter publication supabase_realtime add table public.boards;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'columns'
  ) then
    alter publication supabase_realtime add table public.columns;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'cards'
  ) then
    alter publication supabase_realtime add table public.cards;
  end if;
end $$;

-- 9. Trigger: updated_at otomatis terisi saat row di-update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
  before update on public.boards
  for each row execute function public.handle_updated_at();

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
  before update on public.cards
  for each row execute function public.handle_updated_at();
