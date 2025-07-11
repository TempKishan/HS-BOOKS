
"use client";

import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { ExpenseCategoryChart } from "@/components/reports/expense-category-chart";
import { IncomeExpenseTrendChart } from "@/components/reports/income-expense-trend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useStore } from '@/lib/store';
import { parseISO, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const store = useStore();
  const { expenses, income } = store || {};
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all");
  const isLoading = !store;

  const { paymentMethods } = useMemo(() => {
    if (isLoading || !expenses || !income) return { paymentMethods: [] };
    const allTransactions = [...expenses, ...income];
    const paymentMethodSet = new Set<string>();

    allTransactions.forEach(item => {
      if (item.paymentMethod) {
        paymentMethodSet.add(item.paymentMethod);
      }
    });

    return {
      paymentMethods: Array.from(paymentMethodSet).sort(),
    };
  }, [expenses, income, isLoading]);
  
  const filteredData = useMemo(() => {
    if (isLoading || !expenses || !income) return { expenses: [], income: [] };

    const filterItems = <T extends { date: string, paymentMethod?: string }>(items: T[]): T[] => {
      return items.filter(item => {
        const itemDate = parseISO(item.date);
        
        const dateMatch = dateRange?.from && dateRange?.to 
            ? itemDate >= dateRange.from && itemDate <= dateRange.to 
            : true;
        
        const paymentMethodMatch = selectedPaymentMethod === 'all' || item.paymentMethod === selectedPaymentMethod;
        
        return dateMatch && paymentMethodMatch;
      });
    };
    
    return {
      expenses: filterItems(expenses),
      income: filterItems(income)
    }
  }, [expenses, income, dateRange, selectedPaymentMethod, isLoading]);


  const actions = (
    <div className="flex flex-col sm:flex-row gap-2">
      <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
       <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payment Methods</SelectItem>
          {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <MainLayout>
      <PageHeader title="Reports & Analysis" actions={actions} />
      <div className="p-4 md:p-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Expense Analysis</CardTitle>
            <CardDescription>
              A breakdown of your expenses by category based on the selected filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="h-[350px] w-full" /> : <ExpenseCategoryChart expenses={filteredData.expenses} />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Income vs. Expense Trend</CardTitle>
            <CardDescription>
              A trend analysis of your income and expenses over the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : <IncomeExpenseTrendChart income={filteredData.income} expenses={filteredData.expenses} />}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
