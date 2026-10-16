"use client";

import { useState, type FormEvent } from "react";
import type { Card } from "@/lib/types";
import { labelColor } from "@/lib/labels";
import { Modal, Button, TextInput, TextArea, FieldLabel } from "./ui";

export interface CardUpdate {
  title: string;
  description: string | null;
  labels: string[];
  due_date: string | null;
}

interface Props {
  card: Card | null;
  onClose: () => void;
  onSave: (id: string, update: CardUpdate) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CardModal({ card, onClose, onSave, onDelete }: Props) {
  // State diinisialisasi dari card; parent me-remount modal tiap ganti kartu
  // via key={card.id} sehingga tidak perlu sinkronisasi useEffect.
  const [title, setTitle] = useState(card?.title ?? "");
  const [description, setDescription] = useState(card?.description ?? "");
  const [labels, setLabels] = useState<string[]>(card?.labels ?? []);
  const [dueDate, setDueDate] = useState(card?.due_date ?? "");
  const [labelInput, setLabelInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!card) return null;
  // Narrowed once so closures below keep the non-null type
  const currentCard = card;

  function addLabel(e: FormEvent) {
    e.preventDefault();
    const clean = labelInput.trim().toLowerCase();
    if (!clean || labels.includes(clean)) {
      setLabelInput("");
      return;
    }
    setLabels((prev) => [...prev, clean]);
    setLabelInput("");
  }

  async function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setBusy(true);
    try {
      await onSave(currentCard.id, {
        title: cleanTitle,
        description: description.trim() || null,
        labels,
        due_date: dueDate || null,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setBusy(true);
    try {
      await onDelete(currentCard.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!card} onClose={onClose} labelledBy="card-modal-title">
      <h2
        id="card-modal-title"
        className="font-display text-2xl font-medium text-ink"
      >
        Detail kartu
      </h2>

      <div className="mt-5 space-y-4">
        <div>
          <FieldLabel>Judul</FieldLabel>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Judul kartu"
          />
        </div>

        <div>
          <FieldLabel>Deskripsi</FieldLabel>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ceritakan detail tugasnya…"
          />
        </div>

        <div>
          <FieldLabel>Label</FieldLabel>
          {labels.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {labels.map((label) => {
                const c = labelColor(label);
                return (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full py-1 pl-3 pr-1.5 text-xs font-semibold"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() =>
                        setLabels((prev) => prev.filter((l) => l !== label))
                      }
                      className="rounded-full px-1.5 hover:bg-black/10 cursor-pointer"
                      aria-label={`Hapus label ${label}`}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <form onSubmit={addLabel} className="flex gap-2">
            <TextInput
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="mis. desain, backend…"
              maxLength={24}
              aria-label="Label baru"
            />
            <Button type="submit" variant="soft" size="md">
              Tambah
            </Button>
          </form>
        </div>

        <div>
          <FieldLabel>Tenggat (opsional)</FieldLabel>
          <TextInput
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="max-w-56"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Button
          variant="danger"
          size="sm"
          onClick={() => void handleDelete()}
          disabled={busy}
        >
          {confirmingDelete ? "Yakin? Klik lagi" : "Hapus kartu"}
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={() => void handleSave()} disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
