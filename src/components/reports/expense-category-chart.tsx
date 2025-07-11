
"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Expense } from '@/lib/store';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const percent = payload[0].payload.percent;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col space-y-1 text-center">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold text-foreground">
              ₹{payload[0].value.toFixed(2)} ({percent}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface ExpenseCategoryChartProps {
    expenses: Expense[];
}

export function ExpenseCategoryChart({ expenses }: ExpenseCategoryChartProps) {

  const { categoryData, totalExpenses } = useMemo(() => {
    const categoryMap = new Map<string, number>();
    let total = 0;
    expenses.forEach(expense => {
      total += expense.amount;
      categoryMap.set(
        expense.category,
        (categoryMap.get(expense.category) || 0) + expense.amount
      );
    });
    return {
        categoryData: Array.from(categoryMap, ([name, value]) => ({ name, value })),
        totalExpenses: total
    }
  }, [expenses]);
  
  const chartData = useMemo(() => {
    if (totalExpenses === 0) return [];
    return categoryData.map(item => ({
        ...item,
        percent: ((item.value / totalExpenses) * 100).toFixed(1)
    }));
  }, [categoryData, totalExpenses]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center text-center text-muted-foreground">
        <p>No expense data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip content={<CustomTooltip />} />
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ right: -10 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
