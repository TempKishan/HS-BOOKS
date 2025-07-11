
'use client';

import { MainLayout } from '@/components/main-layout';
import { PageHeader } from '@/components/page-header';
import { TransactionsChart } from '@/components/dashboard/transactions-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { UpcomingPayments } from '@/components/dashboard/upcoming-payments';
import { StatCard } from '@/components/dashboard/stat-card';
import { useStore } from '@/lib/store';
import { useMemo } from 'react';
import {
  DollarSign,
  Landmark,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetSummary } from '@/components/dashboard/budget-summary';
import { CashFlowForecast } from '@/components/dashboard/cash-flow-forecast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const store = useStore();
  
  const isLoading = store === undefined;

  const { totalIncome, totalExpenses, netBalance, totalLoansDue } = useMemo(() => {
    if (isLoading) {
      return { totalIncome: 0, totalExpenses: 0, netBalance: 0, totalLoansDue: 0 };
    }
    const totalIncomeValue = store.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpensesValue = store.expenses.reduce((sum, item) => sum + item.amount, 0);
    const netBalanceValue = totalIncomeValue - totalExpensesValue;
    const totalLoansDueValue = store.loans
      .filter(item => item.type === 'Borrowed' && item.status === 'Ongoing')
      .reduce((sum, item) => {
        const totalPaid = (item.payments || []).reduce((acc, p) => acc + p.amount, 0);
        return sum + (item.principal - totalPaid);
      }, 0);
    return { 
      totalIncome: totalIncomeValue, 
      totalExpenses: totalExpensesValue, 
      netBalance: netBalanceValue, 
      totalLoansDue: totalLoansDueValue 
    };
  }, [isLoading, store]);
  
  if (isLoading) {
    return (
      <MainLayout>
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px]" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Forecast</CardTitle>
                <CardDescription>Estimated balance over the next 30 days based on recurring payments.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Skeleton className="h-[350px]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                  <CardTitle>Overview</CardTitle>
                  <CardDescription>A monthly summary of your income and expenses.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                  <Skeleton className="h-[350px]" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
             <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
                <CardDescription>
                  Your spending progress for this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[140px]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>
                  Next EMIs, subscriptions, and recharges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest financial activities will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px]" />
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={`₹${totalIncome.toFixed(2)}`}
          icon={TrendingUp}
          description={`${store.income.length} income transactions`}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          description={`${store.expenses.length} expense transactions`}
          variant="destructive"
        />
        <StatCard
          title="Net Balance"
          value={`₹${netBalance.toFixed(2)}`}
          icon={DollarSign}
          description="Difference between income and expenses"
        />
        <StatCard
          title="Loans Due"
          value={`₹${totalLoansDue.toFixed(2)}`}
          icon={Landmark}
          description={`${store.loans.filter(l => l.type === 'Borrowed' && l.status === 'Ongoing').length} active loans`}
          variant="warning"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:p-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Forecast</CardTitle>
                <CardDescription>Estimated balance over the next 30 days based on recurring payments.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <CashFlowForecast />
              </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>A monthly summary of your income and expenses.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <TransactionsChart />
            </CardContent>
            </Card>
        </div>
        <div className="space-y-4">
           <Card>
            <CardHeader>
              <CardTitle>Budget Summary</CardTitle>
              <CardDescription>
                Your spending progress for this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetSummary />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>
                Next EMIs, subscriptions, and recharges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingPayments />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest financial activities will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
