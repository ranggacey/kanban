/** Database row types matching supabase/schema.sql */

export interface Board {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Card {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  /** Free-form label names; colors are derived in the UI (see lib/labels.ts) */
  labels: string[];
  /** ISO date string (YYYY-MM-DD) or null */
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}
