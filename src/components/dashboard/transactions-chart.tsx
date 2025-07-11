
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useStore } from '@/lib/store';
import { useMemo } from 'react';
import { format, getMonth, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export function TransactionsChart() {
  const store = useStore();
  const { income, expenses } = store || {};
  
  const isLoading = !store;

  const transactionsData = useMemo(() => {
    if (isLoading || !income || !expenses) return [];
    
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: format(new Date(0, i), 'MMM'),
      income: 0,
      expenses: 0,
    }));

    income.forEach(item => {
      const month = getMonth(parseISO(item.date));
      monthlyData[month].income += item.amount;
    });

    expenses.forEach(item => {
      const month = getMonth(parseISO(item.date));
      monthlyData[month].expenses += item.amount;
    });
    
    const currentMonth = getMonth(new Date());
    const relevantMonths = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - 5 + i + 12) % 12;
        return monthlyData[monthIndex];
    });

    return relevantMonths;
  }, [income, expenses, isLoading]);

  const hasData = useMemo(() => {
    if (isLoading || !income || !expenses) return false;
    return income.length > 0 || expenses.length > 0;
  }, [income, expenses, isLoading]);

  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground">
        <p>No transaction data for the last 6 months.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={transactionsData}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
            }}
            formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
        />
        <Legend
            iconType="circle"
        />
        <Bar
          dataKey="income"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
