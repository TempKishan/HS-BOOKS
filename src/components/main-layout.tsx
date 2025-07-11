
"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Landmark,
  Repeat,
  Smartphone,
  NotebookText,
  Settings,
  PanelLeft,
  PieChart,
  Goal,
  Target,
  Briefcase,
  FileText,
  ArrowRightLeft,
  CalendarDays,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNotifications } from '@/hooks/use-notifications';


const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/income', label: 'Income', icon: TrendingUp },
  { href: '/expenses', label: 'Expenses', icon: TrendingDown },
  { href: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/loans', label: 'Loans & Lending', icon: Landmark },
  { href: '/bills', label: 'Bills', icon: FileText },
  { href: '/budgets', label: 'Budgets', icon: Goal },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/investments', label: 'Investments', icon: Briefcase },
  { href: '/subscriptions', label: 'Subscriptions', icon: Repeat },
  { href: '/recharges', label: 'Recharges', icon: Smartphone },
  { href: '/notes', label: 'Notes', icon: NotebookText },
  { href: '/reports', label: 'Reports', icon: PieChart },
];

function NavLink({ item, pathname, onLinkClick }: { item: typeof navItems[0], pathname: string, onLinkClick?: () => void }) {
    const isActive = pathname === item.href;
    return (
        <Link href={item.href} onClick={onLinkClick} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", isActive && "bg-muted text-primary")}>
            <item.icon className="h-4 w-4" />
            {item.label}
        </Link>
    );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // Initialize notifications
  useNotifications();

  return (
    <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block fixed h-full w-[220px] lg:w-[280px]">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6 text-primary" />
              <span className="">HS Books</span>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
             <nav className="grid items-start text-sm font-medium">
                <Link href="/settings" className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === '/settings' && "bg-muted text-primary")}>
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
             </nav>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:ml-[220px] lg:ml-[280px]">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 sm:px-6 md:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetHeader className="p-4">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">Main navigation links for the application.</SheetDescription>
                         <Link href="/" className="flex items-center gap-2 font-semibold">
                          <Logo className="h-6 w-6 text-primary" />
                          <span className="">HS Books</span>
                        </Link>
                      </SheetHeader>
                      <nav className="grid gap-2 text-lg font-medium p-4">
                          {navItems.map((item) => (
                            <NavLink key={item.href} item={item} pathname={pathname} onLinkClick={() => setMobileNavOpen(false)} />
                          ))}
                      </nav>
                       <div className="mt-auto p-4 border-t">
                         <nav className="grid items-start text-sm font-medium">
                            <Link href="/settings" onClick={() => setMobileNavOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", pathname === '/settings' && "bg-muted text-primary")}>
                                <Settings className="h-4 w-4" />
                                Settings
                            </Link>
                         </nav>
                      </div>
                </SheetContent>
            </Sheet>

           <div className="flex w-full items-center gap-2 font-semibold md:hidden">
             <Logo className="h-6 w-6 text-primary" />
             <span className="">HS Books</span>
           </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
