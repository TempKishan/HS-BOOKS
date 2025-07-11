
"use client";

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { getMonth, getYear } from 'date-fns';
import { Progress } from '../ui/progress';
import { Goal } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function BudgetSummary() {
  const store = useStore();
  const { budgets, expenses } = store || {};

  const isLoading = !store;
  const currentMonth = getMonth(new Date());
  const currentYear = getYear(new Date());

  const budgetWithSpending = useMemo(() => {
    if (isLoading || !budgets || !expenses) return [];
    
    return budgets.map(budget => {
      const spent = expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            return e.category === budget.category &&
                   getMonth(expenseDate) === currentMonth &&
                   getYear(expenseDate) === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { ...budget, spent, progress };
    }).slice(0, 4);
  }, [budgets, expenses, currentMonth, currentYear, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (budgetWithSpending.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center rounded-lg border border-dashed">
        <Goal className="w-12 h-12 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">No budgets set</p>
        <p className="text-xs text-muted-foreground">Go to the Budgets page to add one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {budgetWithSpending.map(budget => (
        <div key={budget.id} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-medium">{budget.category}</p>
            <p className="text-sm text-muted-foreground">
              ₹{budget.spent.toFixed(0)} / ₹{budget.amount.toFixed(0)}
            </p>
          </div>
          <Progress value={budget.progress} />
        </div>
      ))}
    </div>
  );
}
