import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
      <h1 className="text-3xl font-bold text-emphasis">Halaman tidak ditemukan</h1>
      <p className="text-muted text-center max-w-md text-sm">
        Maaf, halaman yang Anda minta tidak tersedia.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold"
        >
          Kembali ke Dashboard
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-slate-800 text-white px-4 py-2 text-sm font-semibold"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

