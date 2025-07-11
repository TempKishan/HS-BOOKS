
"use client";

import React, { useState, useMemo } from 'react';
import { format, parseISO, addMonths, differenceInMonths } from 'date-fns';
import { Goal, deleteContribution } from '@/lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface GoalHistoryProps {
    goal: Goal;
}

export function GoalHistory({ goal }: GoalHistoryProps) {
    const [monthlyContribution, setMonthlyContribution] = useState('');

    const handleDeleteContribution = (contributionId: string) => {
        deleteContribution(goal.id, contributionId);
    }
    
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    const projection = useMemo(() => {
        const contribution = parseFloat(monthlyContribution);
        if (!contribution || contribution <= 0 || remainingAmount <= 0) return null;
        
        const monthsNeeded = Math.ceil(remainingAmount / contribution);
        const projectedDate = addMonths(new Date(), monthsNeeded);
        
        return {
            months: monthsNeeded,
            date: format(projectedDate, 'PPP'),
        }

    }, [monthlyContribution, remainingAmount]);

    const sortedContributions = goal.contributions.slice().sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Amount:</span>
                            <span className="font-medium">₹{goal.targetAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Amount:</span>
                            <span className="font-medium text-primary">₹{goal.currentAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-medium">₹{remainingAmount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>What-If Scenario</CardTitle>
                        <CardDescription>See how fast you can reach your goal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthly-contribution">If I contribute (₹/month):</Label>
                            <Input 
                                id="monthly-contribution" 
                                type="number"
                                placeholder="e.g., 5000"
                                value={monthlyContribution}
                                onChange={(e) => setMonthlyContribution(e.target.value)}
                            />
                        </div>
                        {projection && (
                             <div className="text-sm text-center bg-accent/20 p-3 rounded-md">
                                <p>You could reach your goal in <span className="font-bold text-primary">{projection.months} months</span>, by <span className="font-bold text-primary">{projection.date}</span>.</p>
                             </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                    <CardDescription>All deposits and withdrawals for this goal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[240px] pr-4">
                        {sortedContributions.length > 0 ? (
                            <div className="space-y-4">
                                {sortedContributions.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            {c.type === 'deposit' 
                                                ? <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                : <TrendingDown className="h-5 w-5 text-red-500" />
                                            }
                                            <div>
                                                <p className={cn("font-medium", c.type === 'deposit' ? 'text-emerald-500' : 'text-red-500')}>
                                                    {c.type === 'deposit' ? '+' : '-'}₹{c.amount.toFixed(2)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{format(parseISO(c.date), 'PPP')}</p>
                                            </div>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this contribution record. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive hover:bg-destructive/90"
                                                        onClick={() => handleDeleteContribution(c.id)}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center rounded-lg border border-dashed">
                                <p className="text-sm font-medium text-muted-foreground">No contributions logged yet.</p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
