
"use client";

import React, { useMemo, useState } from 'react';
import {
  Calendar,
  momentLocalizer,
  EventProps,
  ToolbarProps,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useStore } from '@/lib/store';
import { parseISO } from 'date-fns';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  start: Date;
  end: Date;
  title: string;
  resource: {
    type: 'income' | 'expense' | 'bill' | 'subscription' | 'recharge' | 'loan';
    amount?: number;
  };
}

const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = '';
  switch (event.resource.type) {
    case 'income':
      backgroundColor = 'hsl(var(--chart-2))';
      break;
    case 'expense':
      backgroundColor = 'hsl(var(--chart-1))';
      break;
    case 'bill':
      backgroundColor = 'hsl(var(--destructive))';
      break;
    case 'subscription':
      backgroundColor = 'hsl(var(--primary))';
      break;
    case 'recharge':
      backgroundColor = 'hsl(var(--accent))';
      break;
    case 'loan':
      backgroundColor = '#f59e0b'; // amber-500
      break;
    default:
      backgroundColor = 'hsl(var(--muted-foreground))';
  }
  return {
    style: {
      backgroundColor,
      borderRadius: '4px',
      color: 'hsl(var(--primary-foreground))',
      border: 'none',
      display: 'block',
      padding: '2px 4px',
      fontSize: '0.75rem',
    },
  };
};

const CustomEvent = ({ event }: EventProps<CalendarEvent>) => (
  <div className="flex justify-between items-center w-full">
    <span>{event.title}</span>
    {event.resource.amount !== undefined && (
       <span className="font-semibold">{`₹${event.resource.amount.toFixed(0)}`}</span>
    )}
  </div>
);

const CustomToolbar = ({ label, onNavigate }: ToolbarProps) => {
    return (
      <div className="rbc-toolbar items-center mb-4">
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
                <ChevronRight className="h-4 w-4" />
            </Button>
             <Button variant="outline" onClick={() => onNavigate('TODAY')}>Today</Button>
        </div>
        <span className="rbc-toolbar-label font-semibold text-xl">{label}</span>
         <div className="hidden md:flex gap-2 flex-wrap justify-end">
            <Badge className="bg-emerald-500 hover:bg-emerald-500/90">Income</Badge>
            <Badge className="bg-red-500 hover:bg-red-500/90">Expense</Badge>
            <Badge className="bg-yellow-500 hover:bg-yellow-500/90">Loan EMI</Badge>
            <Badge variant="destructive">Bill</Badge>
            <Badge variant="default">Subscription</Badge>
            <Badge className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]">Recharge</Badge>
        </div>
      </div>
    );
  };

export function CalendarView() {
  const { income, expenses, bills, subscriptions, recharges, loans } = useStore();

  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    income.forEach(item => {
      const date = parseISO(item.date);
      calendarEvents.push({
        start: date,
        end: date,
        title: item.description,
        resource: { type: 'income', amount: item.amount },
      });
    });

    expenses.forEach(item => {
      const date = parseISO(item.date);
      calendarEvents.push({
        start: date,
        end: date,
        title: item.description,
        resource: { type: 'expense', amount: item.amount },
      });
    });

    bills.forEach(item => {
        const date = parseISO(item.dueDate);
        calendarEvents.push({
            start: date,
            end: date,
            title: `Bill: ${item.name}`,
            resource: { type: 'bill', amount: item.amount }
        })
    })

    subscriptions.forEach(item => {
        const date = parseISO(item.nextBill);
        calendarEvents.push({
            start: date,
            end: date,
            title: `Sub: ${item.name}`,
            resource: { type: 'subscription', amount: item.amount }
        })
    })

     recharges.forEach(item => {
        const date = parseISO(item.expiryDate);
        calendarEvents.push({
            start: date,
            end: date,
            title: `Recharge: ${item.provider}`,
            resource: { type: 'recharge' }
        })
    })

    loans.filter(l => l.isEmi).forEach(loan => {
        (loan.payments || []).forEach(p => {
             const date = parseISO(p.paymentDate);
            calendarEvents.push({
                start: date,
                end: date,
                title: `EMI: ${loan.lenderName}`,
                resource: { type: 'loan', amount: p.amount }
            })
        })
    })


    return calendarEvents;
  }, [income, expenses, bills, subscriptions, recharges, loans]);

  return (
    <div className="h-[80vh] rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <style>{`
        .rbc-calendar {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
        }
        .rbc-header {
             border-color: hsl(var(--border));
             padding: 8px;
             font-weight: 600;
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
            border-color: hsl(var(--border));
        }
        .rbc-day-bg {
             border-color: hsl(var(--border));
        }
        .rbc-today {
            background-color: hsl(var(--accent) / 0.1);
        }
        .rbc-off-range-bg {
            background-color: hsl(var(--muted) / 0.5);
        }
        .rbc-event {
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
        }
        .rbc-event:focus {
            outline: 2px solid hsl(var(--ring));
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        components={{
            event: CustomEvent,
            toolbar: CustomToolbar
        }}
      />
    </div>
  );
}
