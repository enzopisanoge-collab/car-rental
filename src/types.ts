export interface PLYearData {
  year: number;
  revenue: number;
  cogs: number;
  operatingExpenses: {
    marketing: number;
    salaries: number;
    rent: number;
    utilities: number;
    other: number;
  };
  interest: number;
  taxRate: number; // as a percentage, e.g., 25
}

export interface PLCalculations {
  grossProfit: number;
  totalOpEx: number;
  ebitda: number;
  ebit: number;
  ebt: number;
  taxAmount: number;
  netIncome: number;
  grossMargin: number;
  netMargin: number;
}

export type PLData = PLYearData[];
