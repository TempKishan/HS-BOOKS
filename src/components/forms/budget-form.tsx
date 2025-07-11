
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";


const formSchema = z.object({
  category: z.string().min(2, {
    message: "Category requires at least 2 characters.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
});

export type BudgetFormValues = z.infer<typeof formSchema>;

type BudgetFormProps = {
  onSave: (data: BudgetFormValues) => void;
  onCancel: () => void;
  initialData?: BudgetFormValues;
};

export function BudgetForm({ onSave, onCancel, initialData }: BudgetFormProps) {
  const { expenses } = useStore();
  const [open, setOpen] = React.useState(false);

  const existingCategories = useMemo(() => {
    const categories = new Set(expenses.map(e => e.category));
    return Array.from(categories).map(c => ({ label: c, value: c }));
  }, [expenses]);
  

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      category: "",
      amount: '' as any,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        category: "",
        amount: '' as any,
      });
    }
  }, [initialData, form]);

  function onSubmit(values: BudgetFormValues) {
    onSave(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
             <FormItem className="flex flex-col">
              <FormLabel>Category</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? existingCategories.find(
                            (cat) => cat.value === field.value
                          )?.label
                        : "Select category"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search or create new..." />
                     <CommandList>
                        <CommandEmpty
                            onSelect={() => {
                                const inputValue = (document.querySelector('[cmdk-input]') as HTMLInputElement).value;
                                form.setValue("category", inputValue);
                                setOpen(false);
                            }}
                        >
                          Create new: "{(document.querySelector('[cmdk-input]') as HTMLInputElement)?.value}"
                        </CommandEmpty>
                        <CommandGroup>
                        {existingCategories.map((cat) => (
                            <CommandItem
                            value={cat.label}
                            key={cat.value}
                            onSelect={() => {
                                form.setValue("category", cat.value)
                                setOpen(false)
                            }}
                            >
                            {cat.label}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                     </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount (₹)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="e.g., 5000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
