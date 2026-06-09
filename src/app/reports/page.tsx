'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Download, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Report } from '@/types/report';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await axios.get('/api/reports');
      return response.data as Report[];
    },
  });

  const totals = useMemo(
    () => ({
      revenue: reports.reduce((sum, report) => sum + (report.totalRevenue || 0), 0),
      orders: reports.reduce((sum, report) => sum + (report.totalOrders || 0), 0),
      chats: reports.reduce((sum, report) => sum + (report.totalChats || 0), 0),
      products: reports.reduce((sum, report) => sum + (report.totalProducts || 0), 0),
    }),
    [reports]
  );

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Laporan Shopee Monitor Pro', 14, 20);
    doc.setFontSize(11);
    doc.text(`Jumlah laporan: ${reports.length}`, 14, 32);
    doc.text(`Total pendapatan: ${formatCurrency(totals.revenue)}`, 14, 40);

    let y = 54;
    reports.slice(0, 15).forEach((report, index) => {
      doc.text(
        `${index + 1}. ${report.title} (${report.type}) - ${formatCurrency(report.totalRevenue || 0)}`,
        14,
        y
      );
      y += 8;
      if (y > 180) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save('shopee-monitor-pro-reports.pdf');
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      reports.map((report) => ({
        Judul: report.title,
        Tipe: report.type,
        Pendapatan: report.totalRevenue || 0,
        Pesanan: report.totalOrders || 0,
        Produk: report.totalProducts || 0,
        Chat: report.totalChats || 0,
        Konversi: report.conversionRate || 0,
        Dari: new Date(report.startDate).toLocaleDateString('id-ID'),
        Sampai: new Date(report.endDate).toLocaleDateString('id-ID'),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, 'shopee-monitor-pro-reports.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emphasis">Laporan</h1>
          <p className="mt-2 text-muted">Ringkasan laporan dan ekspor data Saas untuk toko Shopee Anda.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportPDF}>
            <FileText className="mr-2 h-4 w-4" /> Ekspor PDF
          </Button>
          <Button variant="secondary" onClick={exportExcel}>
            <Download className="mr-2 h-4 w-4" /> Ekspor Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-sm">Total Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emphasis">{reports.length}</p>
            <CardDescription>{reports.length ? 'Laporan yang sudah dibuat' : 'Belum ada laporan'}</CardDescription>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-sm">Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emphasis">{formatCurrency(totals.revenue)}</p>
            <CardDescription>Total pendapatan di semua laporan</CardDescription>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-sm">Total Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emphasis">{totals.orders}</p>
            <CardDescription>Ringkasan pesanan semua laporan</CardDescription>
          </CardContent>
        </Card>

        <Card className="surface-glass">
          <CardHeader>
            <CardTitle className="text-sm">Konversi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emphasis">
              {reports.length
                ? `${(
                    reports.reduce((sum, report) => sum + (report.conversionRate || 0), 0) /
                    reports.length
                  ).toFixed(1)}%`
                : '0%'}
            </p>
            <CardDescription>Rata-rata conversion rate</CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="surface-glass">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Daftar Laporan</CardTitle>
              <CardDescription>Monitor laporan periode, pendapatan, dan status ringkas.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Sparkles className="h-4 w-4" />
              Total laporan yang siap ekspor
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-muted">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-muted">Belum ada laporan tersedia.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Dari</TableHead>
                  <TableHead>Sampai</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                  <TableHead className="text-right">Pesanan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium text-emphasis">{report.title}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{new Date(report.startDate).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{new Date(report.endDate).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right font-medium text-emphasis">
                      {formatCurrency(report.totalRevenue || 0)}
                    </TableCell>
                    <TableCell className="text-right">{report.totalOrders || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
