
'use client';
import {
  Avatar
} from '@/components/ui/avatar';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, Landmark, HandCoins } from 'lucide-react';
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

type Activity = {
  id: string;
  type: 'Income' | 'Expense' | 'Loan Taken' | 'Loan Given';
  date: string;
  description: string;
  amount: number;
}

export function RecentActivity() {
  const store = useStore();
  const { income, expenses, loans } = store || {};
  
  const isLoading = !store;

  const recentActivities = useMemo(() => {
    if (isLoading || !income || !expenses || !loans) return [];
    const combined: Activity[] = [
      ...income.map(i => ({ ...i, type: 'Income' as const, date: i.date, description: i.description, amount: i.amount })),
      ...expenses.map(e => ({ ...e, type: 'Expense' as const, date: e.date, description: e.description, amount: e.amount })),
      ...loans.map(l => ({ ...l, type: l.type === 'Borrowed' ? 'Loan Taken' as const : 'Loan Given' as const, date: l.borrowingDate, description: `Loan with ${l.lenderName}`, amount: l.principal }))
    ];
    return combined.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).slice(0, 5);
  }, [income, expenses, loans, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <Skeleton className="ml-auto h-4 w-[60px]" />
          </div>
        ))}
      </div>
    );
  }

  if (recentActivities.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-48 text-center rounded-lg border border-dashed">
        <Wallet className="w-12 h-12 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground">Add income or expenses to see your activity.</p>
      </div>
    )
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'Income': return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        case 'Expense': return <TrendingDown className="h-4 w-4 text-red-500" />;
        case 'Loan Taken': return <Landmark className="h-4 w-4 text-yellow-500" />;
        case 'Loan Given': return <HandCoins className="h-4 w-4 text-blue-500" />;
    }
  }

  const getAmountDetails = (activity: Activity) => {
    switch (activity.type) {
        case 'Income': return { class: 'text-emerald-500', text: `+₹${activity.amount.toFixed(2)}` };
        case 'Expense': return { class: 'text-red-500', text: `-₹${activity.amount.toFixed(2)}` };
        case 'Loan Taken': return { class: 'text-yellow-500', text: `+₹${activity.amount.toFixed(2)}` };
        case 'Loan Given': return { class: 'text-blue-500', text: `-₹${activity.amount.toFixed(2)}` };
    }
  }

  return (
    <div className="space-y-6">
      {recentActivities.map((activity) => {
        const amountDetails = getAmountDetails(activity);
        return (
            <div key={`${activity.type}-${activity.id}`} className="flex items-center">
            <Avatar className="h-9 w-9">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                {getActivityIcon(activity.type)}
                </span>
            </Avatar>
            <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                {activity.description}
                </p>
                <p className="text-sm text-muted-foreground">{format(parseISO(activity.date), 'PPP')}</p>
            </div>
            <div className={cn('ml-auto font-medium', amountDetails.class)}>
                {amountDetails.text}
            </div>
            </div>
        )
      })}
    </div>
  );
}
