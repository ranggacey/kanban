"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo, Button, TextInput, FieldLabel } from "@/components/ui";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"masuk" | "daftar">(
    searchParams.get("mode") === "daftar" ? "daftar" : "masuk",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "daftar") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/boards");
          router.refresh();
        } else {
          setInfo(
            "Pendaftaran berhasil! Cek email kamu untuk verifikasi, lalu masuk.",
          );
          setMode("masuk");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/boards");
        router.refresh();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Coba lagi ya.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 shadow-lift animate-fade-up">
      <div className="mb-6 text-center">
        <Link href="/" aria-label="Kembali ke beranda">
          <Logo className="text-3xl" />
        </Link>
        <p className="mt-2 text-sm text-muted">
          {mode === "masuk"
            ? "Selamat datang kembali 🌿"
            : "Buat akun untuk mulai menggeser"}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-xl bg-cream p-1">
        {(["masuk", "daftar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
              setInfo(null);
            }}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-all duration-150 cursor-pointer",
              mode === m
                ? "bg-surface text-ink shadow-warm"
                : "text-muted hover:text-ink",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <FieldLabel>Kata sandi</FieldLabel>
          <TextInput
            type="password"
            required
            minLength={6}
            autoComplete={mode === "masuk" ? "current-password" : "new-password"}
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[#f6e3dc] px-4 py-2.5 text-sm font-medium text-[#a05a44]"
          >
            {error}
          </p>
        )}
        {info && (
          <p
            role="status"
            className="rounded-xl bg-sage-soft px-4 py-2.5 text-sm font-medium text-sage-dark"
          >
            {info}
          </p>
        )}

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Tunggu sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/" className="hover:text-ink hover:underline">
          ← Kembali ke beranda
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-sage-soft blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-dusty-soft blur-3xl"
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
