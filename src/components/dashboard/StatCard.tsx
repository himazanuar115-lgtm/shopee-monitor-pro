'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-slate-300">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          )}
        </div>
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-white">{value}</div>
          {trend && (
            <div
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
