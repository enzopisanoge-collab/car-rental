import { PLYearData, PLCalculations } from "../types";

export function calculatePL(data: PLYearData): PLCalculations {
  const grossProfit = data.revenue - data.cogs;
  const totalOpEx = Object.values(data.operatingExpenses).reduce((a, b) => a + b, 0);
  const ebitda = grossProfit - totalOpEx;
  const ebit = ebitda; // Simplified: assuming no depreciation/amortization for now
  const ebt = ebit - data.interest;
  const taxAmount = Math.max(0, ebt * (data.taxRate / 100));
  const netIncome = ebt - taxAmount;

  const grossMargin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;
  const netMargin = data.revenue > 0 ? (netIncome / data.revenue) * 100 : 0;

  return {
    grossProfit,
    totalOpEx,
    ebitda,
    ebit,
    ebt,
    taxAmount,
    netIncome,
    grossMargin,
    netMargin,
  };
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};
