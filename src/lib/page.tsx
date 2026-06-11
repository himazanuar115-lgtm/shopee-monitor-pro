'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function LaporanPage() {
  return (
    <div className="animate-fade-in space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Laporan Keuangan</h1>
        <p className="mt-2 text-xs text-slate-400 uppercase tracking-widest font-semibold">Rekapitulasi Omzet & Profit</p>
      </div>

      <div className="bg-[#0f0d1a]/40 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-4">
          <BarChart3 size={32} />
        </div>
        <h2 className="text-white font-bold">Belum Ada Laporan</h2>
        <p className="text-slate-500 text-sm max-w-xs mt-2">Pilih periode tanggal untuk mengunduh laporan penjualan Anda.</p>
      </div>
    </div>
  );
}