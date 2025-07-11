
"use client";

import React, { useState } from 'react';
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, PlusCircle, FilePen, Trash2, Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { InvestmentForm, InvestmentFormValues } from '@/components/forms/investment-form';
import { useStore, Investment, addInvestment, updateInvestment, deleteInvestment } from '@/lib/store';
import { format, parseISO } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function InvestmentsPage() {
  const store = useStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const isLoading = store === undefined;
  const investments = store?.investments;

  const handleSave = (data: InvestmentFormValues) => {
    const investmentData = {
      ...data,
      purchaseDate: format(data.purchaseDate, "yyyy-MM-dd"),
    };

    if (editingInvestment) {
      updateInvestment({ ...investmentData, id: editingInvestment.id });
    } else {
      addInvestment(investmentData);
    }
    
    setIsDialogOpen(false);
    setEditingInvestment(null);
  };

  const handleEditClick = (item: Investment) => {
    setEditingInvestment(item);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingInvestment(null);
    setIsDialogOpen(true);
  }

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingInvestment(null);
    }
    setIsDialogOpen(open);
  }

  const actions = (
     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
        </DialogHeader>
        <InvestmentForm 
          onSave={handleSave} 
          initialData={editingInvestment ? { ...editingInvestment, purchaseDate: parseISO(editingInvestment.purchaseDate) } : undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Investments" actions={actions} />
       <div className="p-4 md:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead className="text-right">Invested Value</TableHead>
                <TableHead className="text-right">Current Value</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : investments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Briefcase className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-medium text-muted-foreground">No investments found</p>
                        <p className="text-xs text-muted-foreground">Click "Add Investment" to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                investments.map((item) => {
                  const investedValue = item.purchasePrice * item.quantity;
                  const currentValue = item.currentValue * item.quantity;
                  const gainLoss = currentValue - investedValue;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{format(parseISO(item.purchaseDate), 'PPP')}</TableCell>
                      <TableCell className="text-right">₹{investedValue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{currentValue.toFixed(2)}</TableCell>
                      <TableCell className={cn("text-right font-semibold flex items-center justify-end gap-1", gainLoss >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {gainLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          ₹{gainLoss.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(item)}>
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
                                    This action cannot be undone. This will permanently delete this investment record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteInvestment(item.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
