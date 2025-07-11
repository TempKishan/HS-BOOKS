
"use client";

import React, { useState } from 'react';
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { MoreVertical, PlusCircle, FilePen, Trash2, Target, History, PiggyBank } from "lucide-react";
import { GoalForm, GoalFormValues } from '@/components/forms/goal-form';
import { useStore, Goal, addGoal, updateGoal, deleteGoal, addContribution } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { GoalContributionForm, ContributionFormValues } from '@/components/forms/goal-contribution-form';
import { GoalHistory } from '@/components/goal-history';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsPage() {
  const store = useStore((state) => state);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const isLoading = store === undefined;
  const goals = store?.goals;

  const handleSaveGoal = (data: GoalFormValues) => {
    const goalData = {
        ...data,
        deadline: data.deadline ? format(data.deadline, "yyyy-MM-dd") : undefined,
    };
    if (editingGoal && goals) {
      const existingGoal = goals.find(g => g.id === editingGoal.id);
      if (existingGoal) {
        updateGoal({ ...existingGoal, ...goalData, id: editingGoal.id });
      }
    } else {
      addGoal(goalData);
    }
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleSaveContribution = (data: ContributionFormValues) => {
    if (selectedGoal) {
      addContribution(selectedGoal.id, {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
      });
    }
    setIsContributionOpen(false);
    setSelectedGoal(null);
  };

  const handleAddClick = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };
  
  const handleEditClick = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleContributeClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsContributionOpen(true);
  };

  const handleHistoryClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsHistoryOpen(true);
  };

  const actions = (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>
        <GoalForm
          onSave={handleSaveGoal}
          initialData={editingGoal ? { ...editingGoal, deadline: editingGoal.deadline ? parseISO(editingGoal.deadline) : undefined } : undefined}
          onCancel={() => setIsFormOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Financial Goals" actions={actions} />
      <div className="p-4 md:p-6">
        {isLoading ? (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                  <CardHeader><Skeleton className="h-5 w-4/5" /></CardHeader>
                  <CardContent className="space-y-2">
                      <Skeleton className="h-7 w-2/5" />
                      <Skeleton className="h-3 w-3/5" />
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2">
                       <Skeleton className="h-2 w-full" />
                       <Skeleton className="h-3 w-3/5" />
                  </CardFooter>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center rounded-lg border border-dashed">
            <Target className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">No goals set yet</p>
            <p className="text-xs text-muted-foreground">Click "Add Goal" to create one.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map(goal => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">{goal.name}</CardTitle>
                    {goal.deadline && (
                      <CardDescription>Deadline: {format(parseISO(goal.deadline), 'PPP')}</CardDescription>
                    )}
                  </div>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => handleContributeClick(goal)}>
                          <PiggyBank className="mr-2 h-4 w-4" />
                          Contribute
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleHistoryClick(goal)}>
                          <History className="mr-2 h-4 w-4" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(goal)}>
                          <FilePen className="mr-2 h-4 w-4" />
                          Edit Goal
                        </DropdownMenuItem>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-destructive hover:text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Goal
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this goal and all its contributions.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteGoal(goal.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{goal.currentAmount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    saved of ₹{goal.targetAmount.toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2">
                    <Progress value={progress} aria-label={`${progress.toFixed(0)}% saved`} />
                    <p className="text-xs text-muted-foreground">
                      {progress.toFixed(0)}% of your goal reached.
                    </p>
                </CardFooter>
              </Card>
            )})}
          </div>
        )}
      </div>

       <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Contribute to: {selectedGoal?.name}</DialogTitle>
                </DialogHeader>
                <GoalContributionForm
                    onSave={handleSaveContribution}
                    onCancel={() => setIsContributionOpen(false)}
                />
            </DialogContent>
        </Dialog>
        
       <Dialog open={isHistoryOpen} onOpenChange={(open) => { if (!open) setSelectedGoal(null); setIsHistoryOpen(open); }}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Contribution History: {selectedGoal?.name}</DialogTitle>
                </DialogHeader>
                {selectedGoal && <GoalHistory goal={selectedGoal} />}
            </DialogContent>
        </Dialog>
    </MainLayout>
  );
}
