'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartProps {
  title: string;
  description?: string;
  data: any[];
  type: 'line' | 'bar' | 'pie';
  dataKey?: string;
  xAxisKey?: string;
}

export default function Chart({
  title,
  description,
  data,
  type,
  dataKey = 'value',
  xAxisKey = 'name',
}: ChartProps) {
  return (
    <Card className="surface-glass">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--muted-foreground),0.18)" />
              <XAxis dataKey={xAxisKey} stroke="hsla(var(--muted-foreground),0.7)" />
              <YAxis stroke="hsla(var(--muted-foreground),0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsla(var(--card),0.96)',
                  border: '1px solid hsla(var(--border),0.22)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--muted-foreground),0.18)" />
              <XAxis dataKey={xAxisKey} stroke="hsla(var(--muted-foreground),0.7)" />
              <YAxis stroke="hsla(var(--muted-foreground),0.7)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsla(var(--card),0.96)',
                  border: '1px solid hsla(var(--border),0.22)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
              <Legend />
              <Bar dataKey={dataKey} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="hsl(var(--accent))"
                dataKey={dataKey}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? 'hsl(var(--primary))'
                        : index === 1
                        ? 'hsl(var(--secondary))'
                        : index === 2
                        ? 'hsl(var(--accent))'
                        : index === 3
                        ? 'hsl(var(--destructive))'
                        : 'hsla(var(--muted-foreground),0.85)'
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsla(var(--card),0.96)',
                  border: '1px solid hsla(var(--border),0.22)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
