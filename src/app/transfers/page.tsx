
"use client";

import React, { useState, useMemo } from 'react';
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
import { MoreHorizontal, PlusCircle, FilePen, Trash2, ArrowLeftRight } from "lucide-react";
import { TransferForm, TransferFormValues } from '@/components/forms/transfer-form';
import { useStore, Transfer, addTransfer, updateTransfer, deleteTransfer } from '@/lib/store';
import { format, parseISO } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';

export default function TransfersPage() {
  const store = useStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);

  const isLoading = store === undefined;
  const transfers = store?.transfers;

  const handleSave = (data: TransferFormValues) => {
    const transferData = {
        ...data,
        date: format(data.date, "yyyy-MM-dd"),
    };

    if (editingTransfer) {
      updateTransfer({ ...transferData, id: editingTransfer.id });
    } else {
      addTransfer(transferData);
    }
    
    setIsDialogOpen(false);
    setEditingTransfer(null);
  };

  const handleEditClick = (item: Transfer) => {
    setEditingTransfer(item);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingTransfer(null);
    setIsDialogOpen(true);
  }

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingTransfer(null);
    }
    setIsDialogOpen(open);
  }

  const actions = (
     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingTransfer ? 'Edit Transfer' : 'Add New Transfer'}</DialogTitle>
        </DialogHeader>
        <TransferForm 
          onSave={handleSave} 
          initialData={editingTransfer ? { ...editingTransfer, date: parseISO(editingTransfer.date) } : undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
  
  const sortedTransfers = useMemo(() => {
    if (isLoading || !transfers) return undefined;
    return transfers.slice().sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [transfers, isLoading]);

  return (
    <MainLayout>
      <PageHeader title="Account Transfers" actions={actions} />
       <div className="p-4 md:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From Account</TableHead>
                <TableHead>To Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
              ) : sortedTransfers && sortedTransfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                        <ArrowLeftRight className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-medium text-muted-foreground">No transfers found</p>
                        <p className="text-xs text-muted-foreground">Click "Add Transfer" to log a movement of funds.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTransfers && sortedTransfers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(parseISO(item.date), 'PPP')}</TableCell>
                  <TableCell className="font-medium">{item.from}</TableCell>
                  <TableCell className="font-medium">{item.to}</TableCell>
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
                                This action cannot be undone. This will permanently delete this transfer record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteTransfer(item.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
}
