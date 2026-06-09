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
    <Card
      className={cn(
        'relative transition-transform duration-200 hover:-translate-y-1',
        'before:absolute before:inset-0 before:bg-[radial-gradient(1000px_circle_at_0%_0%,hsla(var(--primary),0.18),transparent_40%),radial-gradient(900px_circle_at_100%_0%,hsla(var(--accent),0.12),transparent_45%)]',
        'before:pointer-events-none',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5 px-6">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium tracking-wide text-emphasis">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-2 text-xs">{description}</CardDescription>
          )}
        </div>

        {Icon && <Icon className="h-6 w-6 text-muted" />}
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex items-end justify-between gap-4">
          <div className="text-4xl font-semibold leading-none text-emphasis">{value}</div>

          {trend && (
            <div
              className={cn(
                'surface-badge px-3 py-1 text-sm font-semibold',
                trend.isPositive ? 'text-system-primary' : 'text-system-danger'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
