
"use client";

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { addDays, addMonths, eachDayOfInterval, format, parseISO } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '../ui/skeleton';

export function CashFlowForecast() {
  const store = useStore();
  const { loans, subscriptions, income, expenses } = store || {};
  
  const isLoading = !store;

  const forecastData = useMemo(() => {
    if (isLoading || !loans || !subscriptions || !income || !expenses) return [];
    
    const today = new Date();
    const endDate = addDays(today, 30);
    const interval = eachDayOfInterval({ start: today, end: endDate });

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    const recurringExpenses: { date: Date; amount: number }[] = [];

    // Process loans
    loans
      .filter(l => l.type === 'Borrowed' && l.status === 'Ongoing' && l.isEmi && l.emiAmount)
      .forEach(loan => {
        const lastPaymentDate = loan.payments?.length > 0 
            ? new Date(Math.max(...loan.payments.map(p => parseISO(p.paymentDate).getTime())))
            : parseISO(loan.borrowingDate);
        const nextDueDate = addMonths(lastPaymentDate, 1);
        if (nextDueDate <= endDate) {
          recurringExpenses.push({ date: nextDueDate, amount: loan.emiAmount || 0 });
        }
      });

    // Process subscriptions
    subscriptions.forEach(sub => {
        let nextBill = parseISO(sub.nextBill);
        while(nextBill <= endDate) {
             if(nextBill >= today) {
                recurringExpenses.push({ date: nextBill, amount: sub.amount });
             }
             if(sub.cycle === 'Monthly') {
                 nextBill = addMonths(nextBill, 1);
             } else if (sub.cycle === 'Quarterly') {
                 nextBill = addMonths(nextBill, 3);
             } else {
                 break; // Yearly is too far out for a 30 day forecast
             }
        }
    });
    
    let balance = currentBalance;
    const data = interval.map(day => {
        const dailySpending = recurringExpenses
            .filter(e => format(e.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
            .reduce((sum, e) => sum + e.amount, 0);
        
        balance -= dailySpending;

        return {
            date: format(day, 'd MMM'),
            balance: balance,
        };
    });

    return data;
  }, [loans, subscriptions, income, expenses, isLoading]);
  
  if (isLoading) {
    return <Skeleton className="h-[350px] w-full" />
  }

  if (forecastData.length === 0 || !income || income.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground">
        <p>Not enough data for a forecast. Add income and recurring payments.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={forecastData}>
         <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
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
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
          }}
          formatter={(value: number) => [`₹${value.toFixed(2)}`, "Balance"]}
          cursor={{ fill: 'hsl(var(--accent))', radius: 'var(--radius)' }}
        />
        <Area type="monotone" dataKey="balance" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorBalance)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
