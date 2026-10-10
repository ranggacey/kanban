"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Board } from "@/lib/types";
import { Button, TextInput, TextArea, FieldLabel, EmptyState } from "./ui";

export default function BoardList({
  initialBoards,
}: {
  initialBoards: Board[];
}) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("boards")
        .insert({
          user_id: user.id,
          title: cleanTitle,
          description: description.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      setBoards((prev) => [data as Board, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      console.error("Gagal membuat papan:", err);
      alert("Gagal membuat papan. Coba lagi ya.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Hapus papan ini beserta semua kolom dan kartunya?")) {
      return;
    }
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("boards").delete().eq("id", id);
      if (error) throw error;
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Gagal menghapus papan:", err);
      alert("Gagal menghapus papan. Coba lagi ya.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            Papan saya
          </h1>
          <p className="mt-1 text-muted">
            {boards.length === 0
              ? "Belum ada papan. Buat yang pertama yuk 🌱"
              : `${boards.length} papan aktif`}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ Papan baru</Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-2xl border border-line bg-surface p-6 shadow-warm animate-fade-up"
        >
          <h2 className="font-display text-xl font-medium text-ink">
            Buat papan baru
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <FieldLabel>Nama papan</FieldLabel>
              <TextInput
                autoFocus
                required
                maxLength={80}
                placeholder="mis. Proyek Portofolio"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Deskripsi (opsional)</FieldLabel>
              <TextArea
                rows={2}
                maxLength={280}
                placeholder="Ceritakan sedikit tentang papan ini…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Membuat…" : "Buat papan"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      )}

      {boards.length === 0 && !showForm ? (
        <EmptyState
          title="Masih sepi di sini"
          hint="Buat papan pertamamu untuk mulai mengatur tugas dengan cara yang tenang."
          action={
            <Button onClick={() => setShowForm(true)}>+ Buat papan pertama</Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className="group relative rounded-2xl border border-line bg-surface p-6 shadow-warm transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <Link
                href={`/boards/${board.id}`}
                className="absolute inset-0 rounded-2xl"
                aria-label={`Buka papan ${board.title}`}
              />
              <h2 className="font-display text-xl font-medium text-ink">
                {board.title}
              </h2>
              {board.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {board.description}
                </p>
              )}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted">
                  Buka papan →
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(board.id);
                  }}
                  disabled={deletingId === board.id}
                  className="relative z-10 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-[#f6e3dc] hover:text-[#a05a44] cursor-pointer disabled:opacity-50"
                  aria-label={`Hapus papan ${board.title}`}
                >
                  {deletingId === board.id ? "…" : "Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
