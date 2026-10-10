import { createClient } from "@/lib/supabase/server";
import BoardList from "@/components/board-list";
import type { Board } from "@/lib/types";

export const metadata = {
  title: "Papan saya — Geser",
};

export default async function BoardsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  return <BoardList initialBoards={(data ?? []) as Board[]} />;
}
