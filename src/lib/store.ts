
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useState, useEffect } from 'react';

// --- Type Definitions ---
export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod?: string;
}

export interface Income {
    id: string;
    date: string;
    description: string;
    source: string;
    amount: number;
    paymentMethod?: string;
}

export interface EmiPayment {
    id: string;
    paymentDate: string;
    amount: number;
}

export interface Loan {
    id: string;
    type: 'Borrowed' | 'Lent';
    lenderName: string; 
    principal: number; 
    interestRate?: number;
    borrowingDate: string; 
    status: 'Ongoing' | 'Paid';
    payments: EmiPayment[];
    isEmi: boolean;
    repaymentPeriod?: number;
    emiAmount?: number;
}

export interface Subscription {
    id:string; 
    name: string; 
    amount: number; 
    cycle: 'Monthly' | 'Quarterly' | 'Yearly';
    nextBill: string;
    startDate: string;
}

export interface Recharge {
    id: string; 
    service: string; 
    provider: string; 
    plan: string; 
    expiryDate: string;
}

export interface Note {
    id: string; 
    text: string; 
    completed: boolean; 
    priority: 'High' | 'Medium' | 'Low';
    dueDate?: string;
}

export interface Budget {
    id: string;
    category: string;
    amount: number;
}

export interface GoalContribution {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  contributions: GoalContribution[];
}

export interface Investment {
    id: string;
    name: string;
    type: 'Stock' | 'Mutual Fund' | 'Real Estate' | 'Crypto' | 'Other';
    purchaseDate: string;
    purchasePrice: number;
    quantity: number;
    currentValue: number;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
}


// --- Store State & Actions ---
type StoreState = {
  expenses: Expense[];
  income: Income[];
  loans: Loan[];
  subscriptions: Subscription[];
  recharges: Recharge[];
  notes: Note[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  bills: Bill[];
  transfers: Transfer[];
};

type StoreActions = {
  // Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  
  // Income
  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (income: Income) => void;
  deleteIncome: (id: string) => void;

  // Loans
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  logEmiPayment: (loanId: string, payment: Omit<EmiPayment, 'id'>) => void;
  deleteEmiPayment: (loanId: string, paymentId: string) => void;

  // Subscriptions
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;

  // Recharges
  addRecharge: (recharge: Omit<Recharge, 'id'>) => void;
  updateRecharge: (recharge: Recharge) => void;
  deleteRecharge: (id: string) => void;

  // Notes
  addNote: (note: Omit<Note, 'id'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  toggleNote: (id: string) => void;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributions'>) => void;
  updateGoal: (goal: Omit<Goal, 'currentAmount' | 'contributions'>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, contribution: Omit<GoalContribution, 'id'>) => void;
  deleteContribution: (goalId: string, contributionId: string) => void;

  // Investments
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (id: string) => void;

  // Bills
  addBill: (bill: Omit<Bill, 'id' | 'status'>) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (id: string) => void;
  toggleBillStatus: (id: string) => void;

  // Transfers
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  updateTransfer: (transfer: Transfer) => void;
  deleteTransfer: (id: string) => void;


  // Settings
  clearAllData: () => void;
}

export type FullStore = StoreState & StoreActions;

const updateLoanStatus = (loan: Loan): Loan => {
    const totalPaid = (loan.payments || []).reduce((acc, p) => acc + p.amount, 0);
    const newStatus = totalPaid >= loan.principal ? 'Paid' : 'Ongoing';
    return { ...loan, status: newStatus };
}

const recalculateGoalCurrentAmount = (goal: Goal): Goal => {
    const currentAmount = goal.contributions.reduce((acc, contribution) => {
        if (contribution.type === 'deposit') {
            return acc + contribution.amount;
        }
        return acc - contribution.amount;
    }, 0);
    return { ...goal, currentAmount };
};


const store = create<FullStore>()(
    persist(
        (set, get) => ({
            // --- State ---
            expenses: [],
            income: [],
            loans: [],
            subscriptions: [],
            recharges: [],
            notes: [],
            budgets: [],
            goals: [],
            investments: [],
            bills: [],
            transfers: [],

            // --- Actions ---
            addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, { ...expense, id: Date.now().toString() }] })),
            updateExpense: (updatedExpense) => set((state) => ({ expenses: state.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e) })),
            deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),

            addIncome: (income) => set((state) => ({ income: [...state.income, { ...income, id: Date.now().toString() }] })),
            updateIncome: (updatedIncome) => set((state) => ({ income: state.income.map(i => i.id === updatedIncome.id ? updatedIncome : i) })),
            deleteIncome: (id) => set((state) => ({ income: state.income.filter(i => i.id !== id) })),

            addLoan: (loan) => set((state) => ({ loans: [...state.loans, { ...loan, id: Date.now().toString() }] })),
            updateLoan: (updatedLoan) => set((state) => {
                const newLoan = updateLoanStatus(updatedLoan);
                return { loans: state.loans.map(l => l.id === newLoan.id ? newLoan : l) }
            }),
            deleteLoan: (id) => set((state) => ({ loans: state.loans.filter(l => l.id !== id) })),
            logEmiPayment: (loanId, payment) => set((state) => {
                const updatedLoans = state.loans.map(loan => {
                    if (loan.id === loanId) {
                        const newPayments = [...(loan.payments || []), { ...payment, id: Date.now().toString() }];
                        return updateLoanStatus({ ...loan, payments: newPayments });
                    }
                    return loan;
                });
                return { loans: updatedLoans };
            }),
            deleteEmiPayment: (loanId, paymentId) => set((state) => {
                const updatedLoans = state.loans.map(loan => {
                    if (loan.id === loanId) {
                        const newPayments = loan.payments.filter(p => p.id !== paymentId);
                        return updateLoanStatus({ ...loan, payments: newPayments });
                    }
                    return loan;
                });
                return { loans: updatedLoans };
            }),
            
            addSubscription: (subscription) => set((state) => ({ subscriptions: [...state.subscriptions, { ...subscription, id: Date.now().toString() }] })),
            updateSubscription: (updatedSubscription) => set((state) => ({ subscriptions: state.subscriptions.map(s => s.id === updatedSubscription.id ? updatedSubscription : s) })),
            deleteSubscription: (id) => set((state) => ({ subscriptions: state.subscriptions.filter(s => s.id !== id) })),

            addRecharge: (recharge) => set((state) => ({ recharges: [...state.recharges, { ...recharge, id: Date.now().toString() }] })),
            updateRecharge: (updatedRecharge) => set((state) => ({ recharges: state.recharges.map(r => r.id === updatedRecharge.id ? updatedRecharge : r) })),
            deleteRecharge: (id) => set((state) => ({ recharges: state.recharges.filter(r => r.id !== id) })),

            addNote: (note) => set((state) => ({ notes: [...state.notes, { ...note, completed: false, id: Date.now().toString() }] })),
            updateNote: (updatedNote) => set((state) => ({ notes: state.notes.map(n => n.id === updatedNote.id ? updatedNote : n) })),
            deleteNote: (id) => set((state) => ({ notes: state.notes.filter(n => n.id !== id) })),
            toggleNote: (id) => set((state) => ({ notes: state.notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n) })),
            
            addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, { ...budget, id: Date.now().toString() }] })),
            updateBudget: (updatedBudget) => set((state) => ({ budgets: state.budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b) })),
            deleteBudget: (id) => set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) })),

            addGoal: (goal) => set((state) => ({ goals: [...state.goals, { ...goal, id: Date.now().toString(), currentAmount: 0, contributions: [] }] })),
            updateGoal: (updatedGoal) => set((state) => ({ goals: state.goals.map(g => g.id === updatedGoal.id ? { ...g, ...updatedGoal } : g) })),
            deleteGoal: (id) => set((state) => ({ goals: state.goals.filter(g => g.id !== id) })),
            addContribution: (goalId, contribution) => set((state) => {
                const updatedGoals = state.goals.map(goal => {
                    if (goal.id === goalId) {
                        const newContributions = [...goal.contributions, { ...contribution, id: Date.now().toString() }];
                        return recalculateGoalCurrentAmount({ ...goal, contributions: newContributions });
                    }
                    return goal;
                });
                return { goals: updatedGoals };
            }),
            deleteContribution: (goalId, contributionId) => set((state) => {
                const updatedGoals = state.goals.map(goal => {
                    if (goal.id === goalId) {
                        const newContributions = goal.contributions.filter(c => c.id !== contributionId);
                        return recalculateGoalCurrentAmount({ ...goal, contributions: newContributions });
                    }
                    return goal;
                });
                return { goals: updatedGoals };
            }),

            addInvestment: (investment) => set((state) => ({ investments: [...state.investments, { ...investment, id: Date.now().toString() }] })),
            updateInvestment: (updatedInvestment) => set((state) => ({ investments: state.investments.map(i => i.id === updatedInvestment.id ? updatedInvestment : i) })),
            deleteInvestment: (id) => set((state) => ({ investments: state.investments.filter(i => i.id !== id) })),

            addBill: (bill) => set((state) => ({ bills: [...state.bills, { ...bill, id: Date.now().toString(), status: 'Unpaid' }] })),
            updateBill: (updatedBill) => set((state) => ({ bills: state.bills.map(b => b.id === updatedBill.id ? updatedBill : b) })),
            deleteBill: (id) => set((state) => ({ bills: state.bills.filter(b => b.id !== id) })),
            toggleBillStatus: (id) => set((state) => {
                const updatedBills = state.bills.map(bill => {
                    if (bill.id === id) {
                        return { ...bill, status: bill.status === 'Paid' ? 'Unpaid' : 'Paid' };
                    }
                    return bill;
                });
                return { bills: updatedBills };
            }),
            
            addTransfer: (transfer) => set((state) => ({ transfers: [...state.transfers, { ...transfer, id: Date.now().toString() }] })),
            updateTransfer: (updatedTransfer) => set((state) => ({ transfers: state.transfers.map(t => t.id === updatedTransfer.id ? updatedTransfer : t) })),
            deleteTransfer: (id) => set((state) => ({ transfers: state.transfers.filter(t => t.id !== id) })),


            clearAllData: () => {
                if (typeof window !== 'undefined') {
                    const keysToRemove: string[] = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.startsWith('hs-books-app-store') || key.startsWith('hs-books-'))) {
                            keysToRemove.push(key);
                        }
                    }
                    keysToRemove.forEach(key => localStorage.removeItem(key));
                }
                set({
                    expenses: [],
                    income: [],
                    loans: [],
                    subscriptions: [],
                    recharges: [],
                    notes: [],
                    budgets: [],
                    goals: [],
                    investments: [],
                    bills: [],
                    transfers: [],
                });
            },
        }),
        {
            name: 'hs-books-app-store', 
            storage: createJSONStorage(() => localStorage), 
        }
    )
);


// --- Hydration-safe Store Hook ---
// This hook ensures that the store is only accessed on the client-side,
// preventing hydration errors that cause a blank screen.
export const useStore = <T, F>(
  selector: (state: T) => F
): F | undefined => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);
  
  const result = store(selector as any);
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return hydrated ? data : undefined;
};

// Expose the action methods directly from the store instance.
export const { 
    addExpense, updateExpense, deleteExpense,
    addIncome, updateIncome, deleteIncome,
    addLoan, updateLoan, deleteLoan, logEmiPayment, deleteEmiPayment,
    addSubscription, updateSubscription, deleteSubscription,
    addRecharge, updateRecharge, deleteRecharge,
    addNote, updateNote, deleteNote, toggleNote,
    addBudget, updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal, addContribution, deleteContribution,
    addInvestment, updateInvestment, deleteInvestment,
    addBill, updateBill, deleteBill, toggleBillStatus,
    addTransfer, updateTransfer, deleteTransfer,
    clearAllData
} = store.getState();
