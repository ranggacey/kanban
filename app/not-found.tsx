import Link from "next/link";
import { Button, Logo } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <Logo className="mb-8 text-3xl opacity-60" />
      <p className="font-display text-7xl font-semibold text-sage/40">404</p>
      <h1 className="mt-4 font-display text-2xl font-medium text-ink">
        Halaman ini tersesat di hutan
      </h1>
      <p className="mt-2 max-w-sm text-muted">
        Seperti Frieren yang kadang salah jalan — tapi selalu menemukan arah
        pulang. Mari kembali.
      </p>
      <Link href="/" className="mt-6">
        <Button>Kembali ke beranda</Button>
      </Link>
    </div>
  );
}
