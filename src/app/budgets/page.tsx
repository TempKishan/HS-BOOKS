
"use client";

import React, { useState, useMemo } from 'react';
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreVertical, PlusCircle, FilePen, Trash2, Goal } from "lucide-react";
import { BudgetForm, BudgetFormValues } from '@/components/forms/budget-form';
import { useStore, Budget, updateBudget, addBudget, deleteBudget } from '@/lib/store';
import { getMonth, getYear } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetsPage() {
  const store = useStore((state) => state);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const isLoading = store === undefined;
  const { budgets, expenses } = store || {};

  const handleSaveBudget = (data: BudgetFormValues) => {
    if (editingBudget) {
      updateBudget({ ...data, id: editingBudget.id });
    } else {
      addBudget(data);
    }
    setIsDialogOpen(false);
    setEditingBudget(null);
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };
  
  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
  }

  const handleAddClick = () => {
    setEditingBudget(null);
    setIsDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingBudget(null);
    }
    setIsDialogOpen(open);
  };
  
  const budgetWithSpending = useMemo(() => {
    if (isLoading || !budgets || !expenses) return [];
    
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());

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
      const remaining = budget.amount - spent;
      return { ...budget, spent, progress, remaining };
    });
  }, [budgets, expenses, isLoading]);


  const actions = (
    <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
        </DialogHeader>
        <BudgetForm
          onSave={handleSaveBudget}
          initialData={editingBudget || undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Budgets" actions={actions} />
      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader><Skeleton className="h-5 w-3/5" /></CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-7 w-2/5" />
                        <Skeleton className="h-3 w-4/5" />
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2">
                         <Skeleton className="h-2 w-full" />
                         <Skeleton className="h-3 w-3/5" />
                    </CardFooter>
                </Card>
             ))}
          </div>
        ) : budgetWithSpending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
            <Goal className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">No budgets set for this month</p>
            <p className="text-xs text-muted-foreground">Click "Add Budget" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgetWithSpending.map(budget => (
              <Card key={budget.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">{budget.category}</CardTitle>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(budget)}>
                          <FilePen className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive hover:text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this budget.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteBudget(budget.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{budget.spent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    spent of ₹{budget.amount.toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2">
                    <Progress value={budget.progress} aria-label={`${budget.progress.toFixed(0)}% spent`} />
                    <p className="text-xs text-muted-foreground">
                      {budget.remaining >= 0
                        ? `₹${budget.remaining.toFixed(2)} remaining`
                        : `₹${Math.abs(budget.remaining).toFixed(2)} over budget`}
                    </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
