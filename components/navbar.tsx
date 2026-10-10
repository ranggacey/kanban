"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo, Button } from "./ui";

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/boards" aria-label="Geser — daftar papan">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="hidden max-w-56 truncate text-sm text-muted sm:block">
              {userEmail}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} disabled={busy}>
            {busy ? "Keluar…" : "Keluar"}
          </Button>
        </div>
      </div>
    </header>
  );
}
