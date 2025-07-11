
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { parseISO, differenceInDays, addMonths, format } from 'date-fns';

type UpcomingPayment = {
  id: string;
  name: string;
  dueDate: Date;
  type: 'Loan' | 'Subscription' | 'Recharge';
};

const NOTIFICATION_WITHIN_DAYS = 3;
const NOTIFIED_PAYMENTS_KEY = 'hs-books-notified-payments';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const store = useStore(state => state);

    useEffect(() => {
        // This only runs on the client
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            return 'denied';
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    }, []);

    const scheduleNotifications = useCallback(() => {
        if (permission !== 'granted' || !store) return;
        
        const { loans, subscriptions, recharges } = store;

        const notifiedPayments: string[] = JSON.parse(localStorage.getItem(NOTIFIED_PAYMENTS_KEY) || '[]');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming: UpcomingPayment[] = [];

        // Loans
        loans
            .filter(l => l.type === 'Borrowed' && l.status === 'Ongoing' && l.isEmi)
            .forEach(loan => {
                const lastPaymentDate = loan.payments?.length > 0 
                    ? new Date(Math.max(...loan.payments.map(p => parseISO(p.paymentDate).getTime())))
                    : parseISO(loan.borrowingDate);
                const nextDueDate = addMonths(lastPaymentDate, 1);
                upcoming.push({ id: `loan-${loan.id}`, name: `EMI for ${loan.lenderName}`, dueDate: nextDueDate, type: 'Loan' });
            });

        // Subscriptions
        subscriptions.forEach(sub => {
            upcoming.push({ id: `sub-${sub.id}`, name: sub.name, dueDate: parseISO(sub.nextBill), type: 'Subscription' });
        });

        // Recharges
        recharges.forEach(recharge => {
            upcoming.push({ id: `recharge-${recharge.id}`, name: `${recharge.provider} ${recharge.service}`, dueDate: parseISO(recharge.expiryDate), type: 'Recharge' });
        });

        const newNotified: string[] = [];

        upcoming.forEach(payment => {
            const daysUntilDue = differenceInDays(payment.dueDate, today);

            if (daysUntilDue >= 0 && daysUntilDue <= NOTIFICATION_WITHIN_DAYS) {
                if (!notifiedPayments.includes(payment.id)) {
                    new Notification('Upcoming Payment Reminder', {
                        body: `${payment.name} is due on ${format(payment.dueDate, 'PPP')}.`,
                        icon: '/favicon.ico', // You can replace with a proper icon URL
                        tag: payment.id, // Using a tag prevents duplicate notifications for the same item
                    });
                    newNotified.push(payment.id);
                } else {
                     newNotified.push(payment.id); // Keep it in the list of notified items
                }
            }
        });
        
        // Update local storage with the list of items that have been notified for this cycle
        localStorage.setItem(NOTIFIED_PAYMENTS_KEY, JSON.stringify(newNotified));

    }, [permission, store]);
    
    useEffect(() => {
        // Schedule notifications when the component mounts and data is available
        if (store) {
            scheduleNotifications();
        }
    }, [scheduleNotifications, store]);

    return { permission, requestPermission };
}
