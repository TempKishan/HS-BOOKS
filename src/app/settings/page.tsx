
'use client';

import { useRef } from 'react';
import { MainLayout } from "@/components/main-layout";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileDown, Trash2, Bell, BellOff } from 'lucide-react';
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
import { clearAllData } from '@/lib/store';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useNotifications } from '@/hooks/use-notifications';

export default function SettingsPage() {
    const { toast } = useToast();
    const importFileInputRef = useRef<HTMLInputElement>(null);
    const { permission, requestPermission } = useNotifications();

    const handleEnableNotifications = async () => {
        const result = await requestPermission();
        if (result === 'granted') {
            toast({ title: "Notifications Enabled", description: "You will now receive reminders for upcoming payments." });
        } else {
            toast({ variant: 'destructive', title: "Notifications Blocked", description: "You have blocked notifications. You can change this in your browser settings." });
        }
    }
    
    const handleExportData = () => {
        try {
            const dataToExport: { [key: string]: any } = {};
            const keysToExport = ['expenses', 'income', 'loans', 'subscriptions', 'recharges', 'notes', 'budgets', 'hs-books-notified-payments'];
            
            keysToExport.forEach(key => {
                 let item;
                 if (key.startsWith('hs-books-')) {
                     item = localStorage.getItem(key);
                 } else {
                     item = localStorage.getItem(`store_${key}`);
                 }
                 if(item) {
                     dataToExport[key] = JSON.parse(item);
                 }
            });

            const dataStr = JSON.stringify({ hsBooksData: dataToExport }, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hs-books-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Export Successful", description: "Your data has been exported." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Export Failed", description: "Could not export your data." });
        }
    }
    
    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target?.result as string);
                    if (!imported.hsBooksData) throw new Error("Invalid format");
                    
                    Object.keys(imported.hsBooksData).forEach(key => {
                        if (key.startsWith('hs-books-')) {
                            localStorage.setItem(key, JSON.stringify(imported.hsBooksData[key]));
                        } else {
                             localStorage.setItem(`store_${key}`, JSON.stringify(imported.hsBooksData[key]));
                        }
                    });
                    
                    toast({ title: "Import Successful", description: "Your data has been imported. The app will now reload." });
                    setTimeout(() => window.location.reload(), 1500);
                } catch (error) {
                    toast({ variant: 'destructive', title: "Import Failed", description: "The backup file is invalid or corrupted." });
                }
            };
            reader.readAsText(file);
        }
        // Reset the file input so the same file can be selected again
        if(importFileInputRef.current) {
            importFileInputRef.current.value = "";
        }
    }

    const handleClearData = () => {
        clearAllData();
        toast({ title: "Data Cleared", description: "All application data has been removed. The app will now reload." });
        setTimeout(() => window.location.reload(), 1500);
    }

    return (
        <MainLayout>
            <PageHeader title="Settings" />
            <div className="p-4 md:p-6 grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>
                            Customize the look and feel of the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="theme">Theme</Label>
                            <ThemeSwitcher />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Manage reminders for upcoming payments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                           <div>
                                <Label className="font-semibold">Payment Reminders</Label>
                                <p className="text-sm text-muted-foreground">
                                    Status: <span className="font-medium">
                                        {permission === 'granted' && 'Enabled'}
                                        {permission === 'denied' && 'Disabled by user'}
                                        {permission === 'default' && 'Permission not granted'}
                                    </span>
                                </p>
                            </div>
                            {permission === 'default' && (
                                <Button variant="outline" onClick={handleEnableNotifications}><Bell className="mr-2 h-4 w-4" /> Enable Notifications</Button>
                            )}
                            {permission === 'denied' && (
                                 <Button variant="outline" disabled><BellOff className="mr-2 h-4 w-4" /> Disabled</Button>
                            )}
                             {permission === 'granted' && (
                                 <Button variant="outline" disabled><Bell className="mr-2 h-4 w-4 text-green-500" /> Enabled</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>
                            Manage your application data. All data is stored on this device.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label className="font-semibold">Export Data</Label>
                                <p className="text-sm text-muted-foreground">Backup all your data to a JSON file.</p>
                            </div>
                            <Button variant="outline" onClick={handleExportData}><FileDown className="mr-2 h-4 w-4" /> Export</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                                <Label className="font-semibold">Import Data</Label>
                                <p className="text-sm text-muted-foreground">Import data from a backup file.</p>
                            </div>
                            <Button asChild variant="outline">
                                <label>
                                    <FileUp className="mr-2 h-4 w-4" /> Import
                                    <input ref={importFileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportData} />
                                </label>
                            </Button>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex-col items-start gap-4">
                            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                            <div className="w-full flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                            <div>
                                <Label className="font-semibold text-destructive">Clear All Data</Label>
                                <p className="text-sm text-muted-foreground">This will permanently delete all your data. This action cannot be undone.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Clear Data</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all application data from this device, including expenses, income, loans, and settings.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={handleClearData}
                                    >
                                        Continue
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </MainLayout>
    );
}
