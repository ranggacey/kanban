/**
 * Soft, Frieren-inspired chip colors for card labels.
 * Labels are stored as plain strings in the DB; colors are derived
 * deterministically so the same label always gets the same color.
 */

interface LabelColor {
  bg: string;
  text: string;
  dot: string;
}

export const LABEL_PALETTE: LabelColor[] = [
  { bg: "#F4ECDA", text: "#8A6D2B", dot: "#C9A96A" }, // gold
  { bg: "#E3EBF1", text: "#4E6A80", dot: "#7A93A6" }, // dusty blue
  { bg: "#E9EFE2", text: "#5C7050", dot: "#7C8F6E" }, // sage
  { bg: "#F6E3DC", text: "#A05A44", dot: "#D08C6E" }, // terracotta
  { bg: "#EAE3F0", text: "#6E5A8A", dot: "#9A86B8" }, // lavender
  { bg: "#F3DDE2", text: "#9A4A5E", dot: "#C97A8C" }, // rose
];

export function labelColor(label: string): LabelColor {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return LABEL_PALETTE[hash % LABEL_PALETTE.length];
}
