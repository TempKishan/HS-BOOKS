
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
import { MoreHorizontal, PlusCircle, FilePen, Trash2, Smartphone } from "lucide-react";
import { RechargeForm, RechargeFormValues } from '@/components/forms/recharge-form';
import { useStore, Recharge, addRecharge, updateRecharge, deleteRecharge } from '@/lib/store';
import { format, parseISO } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';

export default function RechargesPage() {
  const store = useStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecharge, setEditingRecharge] = useState<Recharge | null>(null);
  
  const isLoading = store === undefined;
  const recharges = store?.recharges;

  const handleSave = (data: RechargeFormValues) => {
    const rechargeData = {
        ...data,
        expiryDate: format(data.expiryDate, "yyyy-MM-dd"),
    };

    if (editingRecharge) {
      updateRecharge({ ...rechargeData, id: editingRecharge.id });
    } else {
      addRecharge(rechargeData);
    }
    
    setIsDialogOpen(false);
    setEditingRecharge(null);
  };

  const handleEditClick = (item: Recharge) => {
    setEditingRecharge(item);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingRecharge(null);
    setIsDialogOpen(true);
  }

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingRecharge(null);
    }
    setIsDialogOpen(open);
  }

  const actions = (
     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Recharge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingRecharge ? 'Edit Recharge' : 'Add New Recharge'}</DialogTitle>
        </DialogHeader>
        <RechargeForm 
          onSave={handleSave} 
          initialData={editingRecharge ? { ...editingRecharge, expiryDate: parseISO(editingRecharge.expiryDate) } : undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Recharge Reminders" actions={actions} />
       <div className="p-4 md:p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Plan Details</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : recharges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                     <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Smartphone className="w-12 h-12 text-muted-foreground" />
                        <p className="mt-4 text-sm font-medium text-muted-foreground">No recharge reminders found</p>
                        <p className="text-xs text-muted-foreground">Click "Add Recharge" to set one up.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recharges.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.service}</TableCell>
                  <TableCell>{item.provider}</TableCell>
                  <TableCell>{item.plan}</TableCell>
                  <TableCell>{format(parseISO(item.expiryDate), 'PPP')}</TableCell>
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
                                This action cannot be undone. This will permanently delete this recharge reminder.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteRecharge(item.id)}>Continue</AlertDialogAction>
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
