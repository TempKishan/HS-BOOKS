
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO, addMonths } from 'date-fns';

import { Loan, logEmiPayment, deleteEmiPayment } from '@/lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
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

const paymentSchema = z.object({
    amount: z.coerce.number().positive("Amount must be a positive number."),
    paymentDate: z.date({ required_error: "A payment date is required." }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface EmiTrackerProps {
    loan: Loan;
}

export function EmiTracker({ loan }: EmiTrackerProps) {
    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: loan.emiAmount || 0,
            paymentDate: new Date(),
        }
    });

    const totalPaid = (loan.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const remainingBalance = loan.principal - totalPaid;

    const lastPaymentDate = loan.payments?.length > 0 
        ? new Date(Math.max(...loan.payments.map(p => parseISO(p.paymentDate).getTime())))
        : parseISO(loan.borrowingDate);

    const nextDueDate = addMonths(lastPaymentDate, 1);
    
    const handleLogPayment = (data: PaymentFormValues) => {
        logEmiPayment(loan.id, {
            amount: data.amount,
            paymentDate: format(data.paymentDate, "yyyy-MM-dd"),
        });
        form.reset({
            amount: loan.emiAmount || 0,
            paymentDate: new Date(),
        });
    }
    
    const handleDeletePayment = (paymentId: string) => {
      deleteEmiPayment(loan.id, paymentId);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {/* Left side: Summary and Form */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Principal:</span>
                            <span className="font-medium">₹{loan.principal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Paid:</span>
                            <span className="font-medium text-emerald-500">₹{totalPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Balance:</span>
                            <span className="font-medium text-red-500">₹{remainingBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                            <span className="text-muted-foreground">Foreclosure Amount:</span>
                            <span className="font-bold text-red-500">₹{remainingBalance.toFixed(2)}</span>
                        </div>
                        <Separator />
                         {loan.isEmi && loan.emiAmount && (
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Monthly EMI:</span>
                                <span className="font-medium">₹{loan.emiAmount.toFixed(2)}</span>
                            </div>
                         )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Due Date:</span>
                            <span className="font-medium">{format(nextDueDate, 'PPP')}</span>
                        </div>
                    </CardContent>
                </Card>

                {remainingBalance > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Log New Payment</CardTitle>
                            <CardDescription>Record a new EMI payment for this loan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleLogPayment)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount Paid (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.01" placeholder="Enter amount" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="paymentDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Payment Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                            >
                                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full">Log Payment</Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Right side: Payment History */}
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                        <CardDescription>A complete record of all payments made.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                             {loan.payments && loan.payments.length > 0 ? (
                                <div className="space-y-4">
                                    {loan.payments
                                        .slice() // Create a copy to avoid mutating the original
                                        .sort((a, b) => parseISO(b.paymentDate).getTime() - parseISO(a.paymentDate).getTime())
                                        .map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                                <div>
                                                    <p className="font-medium">₹{payment.amount.toFixed(2)}</p>
                                                    <p className="text-sm text-muted-foreground">{format(parseISO(payment.paymentDate), 'PPP')}</p>
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
                                                        This will permanently delete this payment record. This action cannot be undone.
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction
                                                        className="bg-destructive hover:bg-destructive/90"
                                                        onClick={() => handleDeletePayment(payment.id)}
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
                                    <p className="text-sm font-medium text-muted-foreground">No payments logged yet.</p>
                                    <p className="text-xs text-muted-foreground">Use the form to log your first payment.</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
