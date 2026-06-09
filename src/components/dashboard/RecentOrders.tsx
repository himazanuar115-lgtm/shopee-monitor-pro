'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Order } from '@/types/order';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/constants';

export default function RecentOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const response = await axios.get('/api/orders?limit=5&sort=newest');
      return response.data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
        <CardDescription>5 pesanan terbaru dari semua toko</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Pesanan</TableHead>
                <TableHead>Pembeli</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pembayaran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-emphasis">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{order.buyerName}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={order.paymentStatus === 'COMPLETED' ? 'surface-badge-primary' : ''}
                    >
                      {PAYMENT_STATUSES[order.paymentStatus as keyof typeof PAYMENT_STATUSES]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
