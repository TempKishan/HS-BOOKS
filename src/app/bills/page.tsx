
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
import { MoreHorizontal, PlusCircle, FilePen, Trash2, FileText, CheckCircle, Circle } from "lucide-react";
import { BillForm, BillFormValues } from '@/components/forms/bill-form';
import { useStore, Bill, addBill, updateBill, deleteBill, toggleBillStatus } from '@/lib/store';
import { format, parseISO } from "date-fns";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function BillsPage() {
  const store = useStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  
  const isLoading = store === undefined;
  const bills = store?.bills;

  const handleSave = (data: BillFormValues) => {
    const billData = {
        ...data,
        dueDate: format(data.dueDate, "yyyy-MM-dd"),
    };

    if (editingBill) {
      updateBill({ ...billData, id: editingBill.id, status: editingBill.status });
    } else {
      addBill(billData);
    }
    
    setIsDialogOpen(false);
    setEditingBill(null);
  };

  const handleEditClick = (item: Bill) => {
    setEditingBill(item);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingBill(null);
    setIsDialogOpen(true);
  }

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingBill(null);
    }
    setIsDialogOpen(open);
  }

  const actions = (
     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
        </DialogHeader>
        <BillForm 
          onSave={handleSave} 
          initialData={editingBill ? { ...editingBill, dueDate: parseISO(editingBill.dueDate) } : undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="One-Time Bills" actions={actions} />
       <div className="p-4 md:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Bill Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-1/2" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-1/4 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                 ))
              ) : bills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-medium text-muted-foreground">No bills found</p>
                        <p className="text-xs text-muted-foreground">Click "Add Bill" to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bills.map((item) => (
                  <TableRow key={item.id} className={cn(item.status === 'Paid' && 'text-muted-foreground line-through')}>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => toggleBillStatus(item.id)} className="rounded-full">
                        {item.status === 'Paid' 
                          ? <CheckCircle className="h-5 w-5 text-green-500" />
                          : <Circle className="h-5 w-5 text-muted-foreground" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell>{format(parseISO(item.dueDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      ₹{item.amount.toFixed(2)}
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
                                  This action cannot be undone. This will permanently delete this bill.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteBill(item.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
