import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KanbanBoard from "@/components/kanban-board";
import type { Board, Column, Card } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select("title")
    .eq("id", id)
    .single();
  return {
    title: data ? `${data.title} — Geser` : "Papan — Geser",
  };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  // Only the owner may open the board (RLS enforces this too)
  if (!board || (board as Board).user_id !== user.id) {
    notFound();
  }

  const [{ data: columns }, { data: cards }] = await Promise.all([
    supabase
      .from("columns")
      .select("*")
      .eq("board_id", id)
      .order("position", { ascending: true }),
    supabase
      .from("cards")
      .select("*")
      .eq("board_id", id)
      .order("position", { ascending: true }),
  ]);

  return (
    <KanbanBoard
      board={board as Board}
      initialColumns={(columns ?? []) as Column[]}
      initialCards={(cards ?? []) as Card[]}
    />
  );
}
