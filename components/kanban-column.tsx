"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column, Card } from "@/lib/types";
import KanbanCard from "./kanban-card";
import { TextInput, Button } from "./ui";
import { cn } from "@/lib/utils";

interface Props {
  column: Column;
  cards: Card[];
  index: number;
  onOpenCard: (card: Card) => void;
  onAddCard: (columnId: string, title: string) => Promise<void>;
  onRenameColumn: (columnId: string, title: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
}

export default function KanbanColumn({
  column,
  cards,
  index,
  onOpenCard,
  onAddCard,
  onRenameColumn,
  onDeleteColumn,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column", column } });

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(column.title);
  const [adding, setAdding] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function commitRename() {
    const clean = draftTitle.trim();
    setEditing(false);
    if (!clean || clean === column.title) {
      setDraftTitle(column.title);
      return;
    }
    await onRenameColumn(column.id, clean);
  }

  function handleRenameKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void commitRename();
    if (e.key === "Escape") {
      setDraftTitle(column.title);
      setEditing(false);
    }
  }

  async function handleDelete() {
    if (
      window.confirm(
        `Hapus kolom "${column.title}" beserta semua kartunya?`,
      )
    ) {
      await onDeleteColumn(column.id);
    }
  }

  async function handleAddCard(e: FormEvent) {
    e.preventDefault();
    const clean = newCardTitle.trim();
    if (!clean) return;
    setBusy(true);
    try {
      await onAddCard(column.id, clean);
      setNewCardTitle("");
      setAdding(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    // Outer wrapper carries the entrance animation; the inner sortable node
    // owns `transform` so the two never fight during drags.
    <div
      className="w-72 shrink-0 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex flex-col rounded-2xl border border-line bg-surface/70 p-3 shadow-warm",
          isDragging && "opacity-40",
        )}
      >
      {/* header — also the drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="mb-2 flex cursor-grab items-center gap-2 rounded-xl px-1.5 py-1 active:cursor-grabbing"
      >
        {editing ? (
          <TextInput
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={() => void commitRename()}
            onKeyDown={handleRenameKey}
            onPointerDown={(e) => e.stopPropagation()}
            className="!py-1 text-sm font-semibold"
            maxLength={60}
            aria-label="Nama kolom"
          />
        ) : (
          <>
            <span
              aria-hidden="true"
              className="select-none text-muted/60"
              title="Seret untuk memindahkan kolom"
            >
              ⋮⋮
            </span>
            <h3 className="flex-1 truncate text-sm font-bold uppercase tracking-wide text-ink/80">
              {column.title}
            </h3>
            <span className="rounded-full bg-cream px-2 py-0.5 text-xs font-bold text-muted">
              {cards.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setDraftTitle(column.title);
                setEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-lg p-1 text-muted transition-colors hover:bg-black/5 hover:text-ink cursor-pointer"
              aria-label={`Ubah nama kolom ${column.title}`}
              title="Ubah nama"
            >
              ✎
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-lg p-1 text-muted transition-colors hover:bg-[#f6e3dc] hover:text-[#a05a44] cursor-pointer"
              aria-label={`Hapus kolom ${column.title}`}
              title="Hapus kolom"
            >
              🗑
            </button>
          </>
        )}
      </div>

      {/* cards */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-16 flex-col gap-2.5">
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} onOpen={onOpenCard} />
          ))}
          {cards.length === 0 && !adding && (
            <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted">
              Kolom masih kosong 🌤️
              <br />
              seret kartu ke sini
            </p>
          )}
        </div>
      </SortableContext>

      {/* add card */}
      {adding ? (
        <form onSubmit={handleAddCard} className="mt-2.5">
          <TextInput
            autoFocus
            placeholder="Judul kartu…"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setAdding(false);
                setNewCardTitle("");
              }
            }}
            maxLength={120}
            aria-label="Judul kartu baru"
          />
          <div className="mt-2 flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              {busy ? "…" : "Tambah"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setNewCardTitle("");
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:bg-black/5 hover:text-ink cursor-pointer"
        >
          + Tambah kartu
        </button>
      )}
      </div>
    </div>
  );
}
