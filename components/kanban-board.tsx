"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import type { Board, Column, Card } from "@/lib/types";
import KanbanColumn from "./kanban-column";
import CardModal, { type CardUpdate } from "./card-modal";
import { Button, TextInput, EmptyState } from "./ui";
import { cn } from "@/lib/utils";

interface Props {
  board: Board;
  initialColumns: Column[];
  initialCards: Card[];
}

export default function KanbanBoard({
  board,
  initialColumns,
  initialCards,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [live, setLive] = useState(false);
  const [modalCard, setModalCard] = useState<Card | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [busyColumn, setBusyColumn] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Di HP: tahan kartu/kolom ~250ms untuk mulai geser,
    // sentuh biasa tetap untuk scroll seperti biasa.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  /* ---------- derived: cards grouped by column, ordered ---------- */
  const cardsByColumn = useMemo(() => {
    const map = new Map<string, Card[]>();
    for (const col of columns) map.set(col.id, []);
    const sorted = [...cards].sort((a, b) => a.position - b.position);
    for (const card of sorted) {
      const arr = map.get(card.column_id);
      if (arr) arr.push(card);
    }
    return map;
  }, [columns, cards]);

  /* ---------- refetch (used by realtime) ---------- */
  const refetch = useCallback(async () => {
    const [{ data: cols }, { data: crds }] = await Promise.all([
      supabase
        .from("columns")
        .select("*")
        .eq("board_id", board.id)
        .order("position", { ascending: true }),
      supabase
        .from("cards")
        .select("*")
        .eq("board_id", board.id)
        .order("position", { ascending: true }),
    ]);
    if (cols) setColumns(cols as Column[]);
    if (crds) setCards(crds as Card[]);
  }, [supabase, board.id]);

  /* ---------- realtime subscription ---------- */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefetch = () => {
      if (timer) clearTimeout(timer);
      // Debounce: coalesce rapid bursts (e.g. our own writes echoing back)
      timer = setTimeout(() => void refetch(), 600);
    };

    const channel = supabase
      .channel(`geser-board-${board.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
          filter: `board_id=eq.${board.id}`,
        },
        scheduleRefetch,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "columns",
          filter: `board_id=eq.${board.id}`,
        },
        scheduleRefetch,
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [supabase, board.id, refetch]);

  /* ---------- persistence helpers ---------- */
  async function persistCardPositions(nextCards: Card[], columnIds: string[]) {
    try {
      await Promise.all(
        nextCards
          .filter((c) => columnIds.includes(c.column_id))
          .map((c) =>
            supabase
              .from("cards")
              .update({ column_id: c.column_id, position: c.position })
              .eq("id", c.id),
          ),
      );
    } catch (err) {
      console.error("Gagal menyimpan posisi kartu:", err);
      void refetch();
    }
  }

  async function persistColumnPositions(nextColumns: Column[]) {
    try {
      await Promise.all(
        nextColumns.map((c, i) =>
          supabase.from("columns").update({ position: i }).eq("id", c.id),
        ),
      );
    } catch (err) {
      console.error("Gagal menyimpan posisi kolom:", err);
      void refetch();
    }
  }

  /* ---------- drag & drop ---------- */
  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type as
      | "card"
      | "column"
      | undefined;
    if (type === "card") {
      const card = cards.find((c) => c.id === event.active.id) ?? null;
      setActiveCard(card);
    } else if (type === "column") {
      const col = columns.find((c) => c.id === event.active.id) ?? null;
      setActiveColumn(col);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    if (!over) return;

    const activeType = active.data.current?.type as
      | "card"
      | "column"
      | undefined;

    /* --- reorder columns --- */
    if (activeType === "column") {
      // Dropping a column onto a card resolves to that card's column
      const overKind = over.data.current?.type as
        | "card"
        | "column"
        | undefined;
      let overColumnId: string;
      if (overKind === "card") {
        const overCard = cards.find((c) => c.id === over.id);
        if (!overCard) return;
        overColumnId = overCard.column_id;
      } else if (overKind === "column") {
        overColumnId = over.id as string;
      } else {
        return;
      }
      if (active.id === overColumnId) return;
      const oldIndex = columns.findIndex((c) => c.id === active.id);
      const newIndex = columns.findIndex((c) => c.id === overColumnId);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove(columns, oldIndex, newIndex);
      setColumns(next);
      void persistColumnPositions(next);
      return;
    }

    /* --- move card --- */
    const movingCard = cards.find((c) => c.id === active.id);
    if (!movingCard) return;

    const overType = over.data.current?.type as "card" | "column" | undefined;
    let targetColumnId: string;
    let targetIndex: number;

    if (overType === "column") {
      targetColumnId = over.id as string;
      targetIndex = cardsByColumn.get(targetColumnId)?.length ?? 0;
    } else {
      const overCard = cards.find((c) => c.id === over.id);
      if (!overCard) return;
      targetColumnId = overCard.column_id;
      const colCards = cardsByColumn.get(targetColumnId) ?? [];
      targetIndex = colCards.findIndex((c) => c.id === overCard.id);
      if (targetIndex === -1) return;
    }

    const sourceColumnId = movingCard.column_id;
    const sourceCards = cardsByColumn.get(sourceColumnId) ?? [];
    const sourceIndex = sourceCards.findIndex((c) => c.id === movingCard.id);

    if (sourceColumnId === targetColumnId && sourceIndex === targetIndex) {
      return; // dropped back in place
    }

    // Build new ordered lists per column (optimistic)
    const ordered = new Map<string, Card[]>();
    for (const col of columns) {
      ordered.set(
        col.id,
        (cardsByColumn.get(col.id) ?? []).filter(
          (c) => c.id !== movingCard.id,
        ),
      );
    }
    const dest = ordered.get(targetColumnId);
    if (!dest) return;

    // Adjust index when moving down within the same column (item removed first)
    let insertAt = targetIndex;
    if (sourceColumnId === targetColumnId && targetIndex > sourceIndex) {
      insertAt = targetIndex - 1;
    }
    insertAt = Math.max(0, Math.min(insertAt, dest.length));
    dest.splice(insertAt, 0, { ...movingCard, column_id: targetColumnId });

    const affected = Array.from(
      new Set([sourceColumnId, targetColumnId]),
    );
    const nextCards: Card[] = [];
    for (const col of columns) {
      const arr = ordered.get(col.id) ?? [];
      arr.forEach((c, i) => nextCards.push({ ...c, position: i }));
    }
    // Keep any stray cards (shouldn't happen, but be safe)
    for (const c of cards) {
      if (!nextCards.some((n) => n.id === c.id)) nextCards.push(c);
    }

    setCards(nextCards);
    void persistCardPositions(nextCards, affected);
  }

  /* ---------- columns CRUD ---------- */
  async function handleAddColumn() {
    const title = newColumnTitle.trim();
    if (!title) return;
    setBusyColumn(true);
    try {
      const { data, error } = await supabase
        .from("columns")
        .insert({
          board_id: board.id,
          title,
          position: columns.length,
        })
        .select()
        .single();
      if (error) throw error;
      setColumns((prev) => [...prev, data as Column]);
      setNewColumnTitle("");
      setAddingColumn(false);
    } catch (err) {
      console.error("Gagal menambah kolom:", err);
      alert("Gagal menambah kolom. Coba lagi ya.");
    } finally {
      setBusyColumn(false);
    }
  }

  async function handleRenameColumn(columnId: string, title: string) {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, title } : c)),
    );
    const { error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId);
    if (error) {
      console.error("Gagal mengubah nama kolom:", error);
      void refetch();
    }
  }

  async function handleDeleteColumn(columnId: string) {
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    setCards((prev) => prev.filter((c) => c.column_id !== columnId));
    const { error } = await supabase
      .from("columns")
      .delete()
      .eq("id", columnId);
    if (error) {
      console.error("Gagal menghapus kolom:", error);
      void refetch();
    }
  }

  /* ---------- cards CRUD ---------- */
  async function handleAddCard(columnId: string, title: string) {
    const position = cardsByColumn.get(columnId)?.length ?? 0;
    const { data, error } = await supabase
      .from("cards")
      .insert({
        board_id: board.id,
        column_id: columnId,
        title,
        position,
      })
      .select()
      .single();
    if (error) throw error;
    setCards((prev) => [...prev, data as Card]);
  }

  async function handleSaveCard(id: string, update: CardUpdate) {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...update } : c)),
    );
    setModalCard((prev) => (prev ? { ...prev, ...update } : prev));
    const { error } = await supabase.from("cards").update(update).eq("id", id);
    if (error) {
      console.error("Gagal menyimpan kartu:", error);
      void refetch();
    }
  }

  async function handleDeleteCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
      console.error("Gagal menghapus kartu:", error);
      void refetch();
    }
  }

  /* ---------- render ---------- */
  return (
    <div className="-mx-4 -mt-8 sm:-mx-6">
      {/* board header */}
      <div className="border-b border-line/70 bg-surface/60 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <Link
            href="/boards"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-muted transition-colors hover:bg-black/5 hover:text-ink"
          >
            <img
              src="/icons/icon-arrow-left.png"
              alt=""
              aria-hidden="true"
              className="h-4 w-4 object-contain"
            />
            Papan
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-ink">
              {board.title}
            </h1>
            {board.description && (
              <p className="truncate text-sm text-muted">{board.description}</p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
              live ? "bg-sage-soft text-sage-dark" : "bg-cream text-muted",
            )}
            title={
              live
                ? "Terhubung realtime — perubahan muncul otomatis"
                : "Menghubungkan realtime…"
            }
          >
            <span className="relative flex h-2 w-2">
              {live && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  live ? "bg-sage" : "bg-muted/50",
                )}
              />
            </span>
            {live ? "Live" : "Menghubungkan…"}
          </span>
        </div>
      </div>

      {/* kanban area */}
      <div className="overflow-x-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-start gap-4 pb-4">
              <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column, i) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={i}
                    cards={cardsByColumn.get(column.id) ?? []}
                    onOpenCard={setModalCard}
                    onAddCard={handleAddCard}
                    onRenameColumn={handleRenameColumn}
                    onDeleteColumn={handleDeleteColumn}
                  />
                ))}
              </SortableContext>

              {/* add column */}
              {addingColumn ? (
                <div className="w-[85vw] shrink-0 rounded-2xl border border-line bg-surface/70 p-3 shadow-warm animate-fade-up sm:w-72">
                  <TextInput
                    autoFocus
                    placeholder="Nama kolom…"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAddColumn();
                      if (e.key === "Escape") {
                        setAddingColumn(false);
                        setNewColumnTitle("");
                      }
                    }}
                    maxLength={60}
                    aria-label="Nama kolom baru"
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleAddColumn()}
                      disabled={busyColumn}
                    >
                      {busyColumn ? "…" : "Tambah"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAddingColumn(false);
                        setNewColumnTitle("");
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingColumn(true)}
                  className="w-[85vw] shrink-0 rounded-2xl border border-dashed border-line bg-surface/40 px-4 py-4 text-left text-sm font-medium text-muted transition-all hover:border-sage hover:text-sage-dark cursor-pointer sm:w-72"
                >
                  + Tambah kolom
                </button>
              )}
            </div>

            <DragOverlay dropAnimation={{ duration: 180 }}>
              {activeCard ? (
                <div className="w-[85vw] rotate-2 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-lift sm:w-72">
                  <p className="text-[15px] font-medium text-ink">
                    {activeCard.title}
                  </p>
                </div>
              ) : activeColumn ? (
                <div className="w-[85vw] rounded-2xl border border-line bg-surface/90 p-3 shadow-lift sm:w-72">
                  <p className="text-sm font-bold uppercase tracking-wide text-ink/80">
                    {activeColumn.title}
                  </p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {columns.length === 0 && (
            <div className="max-w-md">
              <EmptyState
                title="Papan masih kosong"
                hint="Tambah kolom pertama — misalnya “Rencana”, “Dikerjakan”, “Selesai” — lalu mulai geser kartumu."
              />
            </div>
          )}
        </div>
      </div>

      <CardModal
        key={modalCard?.id ?? "closed"}
        card={modalCard}
        onClose={() => setModalCard(null)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}
