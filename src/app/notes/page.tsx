
"use client";

import React, { useState } from 'react';
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, StickyNote, Trash2, FilePen, MoreHorizontal } from "lucide-react";
import { useStore, Note, addNote, updateNote, deleteNote, toggleNote } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteForm, NoteFormValues } from '@/components/forms/note-form';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from '@/components/ui/skeleton';

export default function NotesPage() {
  const store = useStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const isLoading = store === undefined;
  const notes = store?.notes;

  const handleSaveNote = (data: NoteFormValues) => {
    const noteData = {
        ...data,
        dueDate: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : undefined,
        completed: editingNote ? editingNote.completed : false,
    };
    if (editingNote) {
        updateNote({ ...noteData, id: editingNote.id });
    } else {
        addNote(noteData);
    }
    setIsDialogOpen(false);
    setEditingNote(null);
  };
  
  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingNote(null);
    setIsDialogOpen(true);
  }

  const closeDialog = (open: boolean) => {
    if (!open) {
      setEditingNote(null);
    }
    setIsDialogOpen(open);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-red-500';
      case 'Medium':
        return 'border-l-yellow-500';
      case 'Low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const actions = (
     <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Note/To-Do
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        </DialogHeader>
        <NoteForm 
          onSave={handleSaveNote} 
          initialData={editingNote ? { ...editingNote, dueDate: editingNote.dueDate ? parseISO(editingNote.dueDate) : undefined } : undefined}
          onCancel={() => closeDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <PageHeader title="Notes & To-Do" actions={actions} />
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-4 space-y-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8" />
                </div>
              ))
            ) : notes.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-center rounded-lg border border-dashed">
                <StickyNote className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No notes or to-dos yet</p>
                <p className="text-xs text-muted-foreground">Click "Add Note/To-Do" to get started.</p>
              </div>
            ) : notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md bg-background border-l-4 transition-opacity",
                  getPriorityColor(note.priority),
                  note.completed ? 'opacity-50' : ''
                )}
              >
                <Checkbox
                  id={note.id}
                  checked={note.completed}
                  onCheckedChange={() => toggleNote(note.id)}
                  aria-label={`Mark task as ${note.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1 space-y-1">
                    <label
                      htmlFor={note.id}
                      className={cn(
                        "text-sm font-medium leading-none cursor-pointer",
                        note.completed ? 'line-through text-muted-foreground' : ''
                      )}
                    >
                      {note.text}
                    </label>
                    {note.dueDate && (
                        <p className={cn("text-xs text-muted-foreground", note.completed && 'line-through')}>
                            Due: {format(parseISO(note.dueDate), 'PPP')}
                        </p>
                    )}
                </div>
                 <Badge variant="outline">{note.priority}</Badge>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(note)}>
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
                            This action cannot be undone. This will permanently delete this note.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteNote(note.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
