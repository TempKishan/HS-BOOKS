
'use client';

import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { addMonths, format, formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Landmark, Repeat, Smartphone, CalendarClock, FileText } from 'lucide-react';
import {
  Avatar
} from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';

type UpcomingPayment = {
  id: string;
  type: 'Loan' | 'Subscription' | 'Recharge' | 'Bill';
  name: string;
  dueDate: string;
  amount: number;
};

export function UpcomingPayments() {
  const store = useStore();
  const { loans, subscriptions, recharges, bills } = store || {};

  const isLoading = !store;

  const upcomingPayments = useMemo(() => {
    if (isLoading || !loans || !subscriptions || !recharges || !bills) return [];
    
    const combined: UpcomingPayment[] = [];

    // Process loans
    loans
      .filter(l => l.type === 'Borrowed' && l.status === 'Ongoing' && l.isEmi && l.emiAmount)
      .forEach(loan => {
        const lastPaymentDate = loan.payments?.length > 0 
            ? new Date(Math.max(...loan.payments.map(p => parseISO(p.paymentDate).getTime())))
            : parseISO(loan.borrowingDate);
        const nextDueDate = addMonths(lastPaymentDate, 1);
        
        combined.push({
          id: `loan-${loan.id}`,
          type: 'Loan',
          name: `EMI for ${loan.lenderName}`,
          dueDate: format(nextDueDate, 'yyyy-MM-dd'),
          amount: loan.emiAmount || 0,
        });
      });

    // Process subscriptions
    subscriptions.forEach(sub => {
      combined.push({
        id: `sub-${sub.id}`,
        type: 'Subscription',
        name: sub.name,
        dueDate: sub.nextBill,
        amount: sub.amount,
      });
    });

    // Process recharges
    recharges.forEach(recharge => {
      combined.push({
        id: `recharge-${recharge.id}`,
        type: 'Recharge',
        name: `${recharge.provider} ${recharge.service}`,
        dueDate: recharge.expiryDate,
        amount: 0, // Recharges don't have a fixed amount
      });
    });

    // Process bills
    bills.filter(b => b.status === 'Unpaid').forEach(bill => {
        combined.push({
            id: `bill-${bill.id}`,
            type: 'Bill',
            name: bill.name,
            dueDate: bill.dueDate,
            amount: bill.amount,
        });
    });
    
    // Sort by due date and take the next 5
    return combined
      .filter(p => parseISO(p.dueDate) >= new Date())
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 5);
  }, [loans, subscriptions, recharges, bills, isLoading]);

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

  if (upcomingPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center rounded-lg border border-dashed">
        <CalendarClock className="w-12 h-12 text-muted-foreground" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">No upcoming payments</p>
        <p className="text-xs text-muted-foreground">Everything is settled for now.</p>
      </div>
    );
  }

  const getPaymentIcon = (type: UpcomingPayment['type']) => {
    switch (type) {
      case 'Loan': return <Landmark className="h-4 w-4" />;
      case 'Subscription': return <Repeat className="h-4 w-4" />;
      case 'Recharge': return <Smartphone className="h-4 w-4" />;
      case 'Bill': return <FileText className="h-4 w-4" />;
    }
  };
  
  const getAmountColor = (type: UpcomingPayment['type']) => {
    switch (type) {
      case 'Loan': return 'text-yellow-500';
      case 'Subscription': return 'text-red-500';
      case 'Recharge': return 'text-blue-500';
      case 'Bill': return 'text-orange-500';
    }
  };

  return (
    <div className="space-y-6">
      {upcomingPayments.map(payment => {
        const amountText = payment.amount > 0 ? `₹${payment.amount.toFixed(2)}` : 'Check Plan';
        const dueDate = parseISO(payment.dueDate);
        return (
          <div key={payment.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <span className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", getAmountColor(payment.type))}>
                {getPaymentIcon(payment.type)}
              </span>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{payment.name}</p>
              <p className="text-sm text-muted-foreground">
                Due {formatDistanceToNow(dueDate, { addSuffix: true })} on {format(dueDate, 'do MMM')}
              </p>
            </div>
            <div className={cn('ml-auto text-sm font-medium', payment.amount > 0 ? 'text-foreground' : 'text-muted-foreground')}>
              {amountText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
