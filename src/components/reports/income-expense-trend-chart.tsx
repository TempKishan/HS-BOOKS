
"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Income, Expense } from '@/lib/store';
import { format, parseISO, eachDayOfInterval, differenceInDays } from 'date-fns';

interface IncomeExpenseTrendChartProps {
    income: Income[];
    expenses: Expense[];
}

export function IncomeExpenseTrendChart({ income, expenses }: IncomeExpenseTrendChartProps) {

    const chartData = useMemo(() => {
        if (income.length === 0 && expenses.length === 0) return [];
        
        const allDates = [...income.map(i => parseISO(i.date)), ...expenses.map(e => parseISO(e.date))];
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        const interval = eachDayOfInterval({ start: minDate, end: maxDate });
        const isLongRange = differenceInDays(maxDate, minDate) > 60;

        const dataMap = new Map<string, { income: number; expenses: number }>();

        // Initialize map
        interval.forEach(day => {
            const key = isLongRange ? format(day, 'yyyy-MM') : format(day, 'yyyy-MM-dd');
            if (!dataMap.has(key)) {
                dataMap.set(key, { income: 0, expenses: 0 });
            }
        });

        income.forEach(item => {
            const date = parseISO(item.date);
            const key = isLongRange ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
            if (dataMap.has(key)) {
                dataMap.get(key)!.income += item.amount;
            }
        });

        expenses.forEach(item => {
            const date = parseISO(item.date);
            const key = isLongRange ? format(date, 'yyyy-MM') : format(date, 'yyyy-MM-dd');
            if (dataMap.has(key)) {
                dataMap.get(key)!.expenses += item.amount;
            }
        });

        return Array.from(dataMap.entries()).map(([dateKey, values]) => ({
            name: isLongRange ? format(parseISO(dateKey), 'MMM yyyy') : format(parseISO(dateKey), 'd MMM'),
            ...values,
        })).sort((a, b) => parseISO(a.name).getTime() - parseISO(b.name).getTime());
    }, [income, expenses]);

    if (chartData.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center text-center text-muted-foreground">
                <p>No data available for the selected filters.</p>
            </div>
        );
    }
  
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    cursor={{ fill: 'hsla(var(--accent) / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-2))" activeDot={{ r: 8 }} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-1))" activeDot={{ r: 8 }} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
