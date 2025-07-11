
/**
 * @fileOverview Financial calculation utility functions.
 */

/**
 * Calculates the Equated Monthly Installment (EMI) for a loan.
 * @param principal The principal loan amount.
 * @param annualRate The annual interest rate in percent (e.g., 8.5 for 8.5%).
 * @param months The total number of months for repayment.
 * @returns An object containing the monthly EMI, total interest, and total payment.
 */
export function calculateEmi(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || annualRate < 0 || months <= 0) {
    return { emi: 0, totalInterest: 0, totalPayment: principal };
  }

  // Handle zero interest rate case
  if (annualRate === 0) {
    const emi = principal / months;
    return { emi, totalInterest: 0, totalPayment: principal };
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;

  return { emi, totalInterest, totalPayment };
}
