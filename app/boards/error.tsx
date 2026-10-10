"use client";

import { useEffect } from "react";
import { Button, Logo } from "@/components/ui";

export default function BoardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Boards error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-6 text-3xl opacity-60" />
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6e3dc] text-3xl">
        <span aria-hidden="true">🌧️</span>
      </div>
      <h1 className="font-display text-2xl font-medium text-ink">
        Aduh, ada yang tidak beres
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        Tenang, datamu aman. Coba muat ulang — biasanya awan gelapnya cepat
        berlalu.
      </p>
      <Button onClick={() => reset()} className="mt-6">
        Coba lagi
      </Button>
    </div>
  );
}
