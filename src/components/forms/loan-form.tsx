
"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import React, { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { calculateEmi } from "@/lib/finance";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  type: z.enum(["Borrowed", "Lent"], { required_error: "You need to select a loan type." }),
  lenderName: z.string().min(2, { message: "This field requires at least 2 characters." }),
  principal: z.coerce.number().positive("Principal amount must be a positive number."),
  interestRate: z.coerce.number().min(0, "Interest rate cannot be negative.").optional(),
  borrowingDate: z.date({ required_error: "A borrowing date is required." }),
  isEmi: z.boolean().default(false),
  repaymentPeriod: z.coerce.number().optional(), // in months
  emiAmount: z.coerce.number().optional(),
});

export type LoanFormValues = z.infer<typeof formSchema>;

type LoanFormProps = {
  onSave: (data: LoanFormValues) => void;
  onCancel: () => void;
  initialData?: LoanFormValues;
};

export function LoanForm({ onSave, onCancel, initialData }: LoanFormProps) {
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: "Borrowed",
      lenderName: "",
      principal: '' as any,
      interestRate: '' as any,
      borrowingDate: new Date(),
      isEmi: false,
      repaymentPeriod: '' as any,
      emiAmount: '' as any,
    },
  });

  const { control, setValue } = form;
  const watchedFields = useWatch({ control, name: ["principal", "interestRate", "repaymentPeriod", "isEmi"] });

  const emiDetails = useMemo(() => {
    const [principal, interestRate, repaymentPeriod, isEmi] = watchedFields;
    if (isEmi && principal > 0 && interestRate && interestRate >= 0 && repaymentPeriod > 0) {
      const { emi, totalInterest, totalPayment } = calculateEmi(principal, interestRate, repaymentPeriod);
      return { emi, totalInterest, totalPayment };
    }
    return null;
  }, [watchedFields]);

  useEffect(() => {
    if (emiDetails) {
      setValue("emiAmount", emiDetails.emi);
    } else {
        setValue("emiAmount", undefined);
    }
  }, [emiDetails, setValue]);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        type: "Borrowed",
        lenderName: "",
        principal: '' as any,
        interestRate: '' as any,
        borrowingDate: new Date(),
        isEmi: false,
        repaymentPeriod: '' as any,
        emiAmount: '' as any,
      });
    }
  }, [initialData, form]);

  function onSubmit(values: LoanFormValues) {
    onSave(values);
    form.reset();
  }
  
  const isEmi = useWatch({ control: form.control, name: 'isEmi' });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Loan Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Borrowed" />
                    </FormControl>
                    <FormLabel className="font-normal">I Borrowed</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Lent" />
                    </FormControl>
                    <FormLabel className="font-normal">I Lent</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lenderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lender's Name / Institution</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe or City Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="principal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Principal Amount (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 50000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="borrowingDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Borrowing Date</FormLabel>
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

        <FormField
            control={form.control}
            name="isEmi"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <FormLabel>Setup as EMI Loan</FormLabel>
                        <FormDescription>
                            Calculate and track monthly payments.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />

        {isEmi && (
            <div className="space-y-4 rounded-md border p-4">
                 <FormField
                    control={form.control}
                    name="interestRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Interest Rate (% p.a.)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 8.5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="repaymentPeriod"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Repayment Period (in Months)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 24" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {emiDetails && (
                    <Card className="bg-muted/50">
                       <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium">Calculation Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 text-sm">
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Monthly EMI:</span>
                                <span className="font-semibold text-primary">₹{emiDetails.emi.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Interest:</span>
                                <span>₹{emiDetails.totalInterest.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Payment:</span>
                                <span>₹{emiDetails.totalPayment.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
