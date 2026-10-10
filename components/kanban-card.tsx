"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card } from "@/lib/types";
import { labelColor } from "@/lib/labels";
import { formatDateID, isOverdue, cn } from "@/lib/utils";

export default function KanbanCard({
  card,
  onOpen,
}: {
  card: Card;
  onOpen: (card: Card) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: "card", card } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(card.due_date);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card)}
      className={cn(
        "cursor-grab rounded-xl border border-line/70 bg-surface px-3.5 py-3 shadow-warm",
        "transition-shadow duration-150 hover:shadow-lift active:cursor-grabbing",
        isDragging && "opacity-40 shadow-lift",
      )}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {card.labels.map((label) => {
            const c = labelColor(label);
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: c.bg, color: c.text }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: c.dot }}
                />
                {label}
              </span>
            );
          })}
        </div>
      )}

      <p className="text-[15px] font-medium leading-snug text-ink">
        {card.title}
      </p>

      {card.description && (
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {card.description}
        </p>
      )}

      {card.due_date && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-semibold",
            overdue
              ? "bg-[#f6e3dc] text-[#a05a44]"
              : "bg-dusty-soft text-[#4e6a80]",
          )}
        >
          <span aria-hidden="true">📅</span>
          {formatDateID(card.due_date)}
          {overdue && " • lewat"}
        </p>
      )}
    </div>
  );
}
