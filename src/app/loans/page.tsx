
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
import { MoreHorizontal, PlusCircle, FilePen, Trash2, Landmark, Eye } from "lucide-react";
import { LoanForm, LoanFormValues } from '@/components/forms/loan-form';
import { useStore, Loan, addLoan, updateLoan, deleteLoan } from '@/lib/store';
import { format, parseISO } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmiTracker } from '@/components/emi-tracker';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoansPage() {
  const store = useStore((state) => state);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const isLoading = store === undefined;
  const loans = store?.loans;

  const handleSave = (data: LoanFormValues) => {
    const loanData = {
        ...data,
        borrowingDate: format(data.borrowingDate, "yyyy-MM-dd"),
    };

    if (editingLoan && loans) {
      // Preserve existing payments when updating
      const existingLoan = loans.find(l => l.id === editingLoan.id);
      updateLoan({ ...existingLoan, ...loanData, id: editingLoan.id, payments: existingLoan?.payments || [] });
    } else {
      addLoan({ ...loanData, payments: [], status: 'Ongoing' });
    }
    
    setIsFormOpen(false);
    setEditingLoan(null);
  };

  const handleEditClick = (item: Loan) => {
    setEditingLoan(item);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingLoan(null);
    setIsFormOpen(true);
  }

  const handleViewEmi = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsTrackerOpen(true);
  }

  const actions = (
     <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingLoan ? 'Edit Loan' : 'Add New Loan'}</DialogTitle>
        </DialogHeader>
        <LoanForm 
          onSave={handleSave} 
          initialData={editingLoan ? { ...editingLoan, borrowingDate: parseISO(editingLoan.borrowingDate) } : undefined}
          onCancel={() => setIsFormOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Loan & Lending" actions={actions} />
       <div className="p-4 md:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Person/Institution</TableHead>
                <TableHead>Date Borrowed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                     <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Landmark className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-medium text-muted-foreground">No loans found</p>
                        <p className="text-xs text-muted-foreground">Click "Add Loan" to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((item) => {
                  const totalPaid = (item.payments || []).reduce((acc, p) => acc + p.amount, 0);
                  const balance = item.principal - totalPaid;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={item.type === "Borrowed" ? "destructive" : "secondary"}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.lenderName}</TableCell>
                      <TableCell>{format(parseISO(item.borrowingDate), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'Paid' ? 'default' : 'outline'} className={cn(item.status === 'Ongoing' && 'border-yellow-500 text-yellow-500')}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{item.principal.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-emerald-500">₹{totalPaid.toFixed(2)}</TableCell>
                      <TableCell className={cn("text-right", balance > 0 ? "text-red-500" : "text-foreground")}>₹{balance.toFixed(2)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.type === 'Borrowed' && (
                              <DropdownMenuItem onClick={() => handleViewEmi(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View/Manage EMI
                              </DropdownMenuItem>
                            )}
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
                                    This action cannot be undone. This will permanently delete this loan and all its associated EMI payments.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteLoan(item.id)}>Continue</AlertDialogAction>
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
      <Dialog open={isTrackerOpen} onOpenChange={(open) => { if (!open) setSelectedLoan(null); setIsTrackerOpen(open); }}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                  <DialogTitle>EMI Tracker for: {selectedLoan?.lenderName}</DialogTitle>
              </DialogHeader>
              {selectedLoan && <EmiTracker loan={selectedLoan} />}
          </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
