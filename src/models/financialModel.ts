import { Transaction, Budget } from "../types";

/**
 * financialModel.ts (Model)
 * Handles data rules, static defaults, calculations, and data serialization (CSV export).
 */

export const DEFAULT_CATEGORIES = [
  "Makanan & Kopi",
  "Tech Bloat & Tools",
  "Kebutuhan Rumah",
  "Investasi & Tabungan",
  "Gaya Hidup & Hobi",
  "Gaji & Pendapatan"
];

export function getDefaultTransactions(): Transaction[] {
  const suffix = Math.random().toString(36).substring(2, 8);
  return [
    {
      id: `tx-1-${suffix}`,
      date: "2026-06-28",
      description: "Gaji Bulanan Utama",
      category: "Gaji & Pendapatan",
      type: "income",
      amount: 15000000
    },
    {
      id: `tx-2-${suffix}`,
      date: "2026-06-28",
      description: "Langganan Cloud Server VPS",
      category: "Tech Bloat & Tools",
      type: "expense",
      amount: 450000,
      isRecurring: true,
      recurringInterval: "monthly"
    },
    {
      id: `tx-3-${suffix}`,
      date: "2026-06-29",
      description: "Kopi Specialty V60",
      category: "Makanan & Kopi",
      type: "expense",
      amount: 65000
    },
    {
      id: `tx-4-${suffix}`,
      date: "2026-06-29",
      description: "Dividen Reksa Dana",
      category: "Investasi & Tabungan",
      type: "income",
      amount: 1200000
    },
    {
      id: `tx-5-${suffix}`,
      date: "2026-06-29",
      description: "Tagihan Listrik & WiFi",
      category: "Kebutuhan Rumah",
      type: "expense",
      amount: 850000,
      isRecurring: true,
      recurringInterval: "monthly"
    },
    {
      id: `tx-6-${suffix}`,
      date: "2026-06-29",
      description: "Makan All-You-Can-Eat",
      category: "Makanan & Kopi",
      type: "expense",
      amount: 320000
    }
  ];
}

export function getDefaultBudgets(): Budget[] {
  return [
    { category: "Makanan & Kopi", allocated: 3000000, spent: 385000, icon: "☕" },
    { category: "Tech Bloat & Tools", allocated: 1500000, spent: 450000, icon: "💻" },
    { category: "Kebutuhan Rumah", allocated: 2500000, spent: 850000, icon: "🏠" },
    { category: "Investasi & Tabungan", allocated: 5000000, spent: 0, icon: "📈" },
    { category: "Gaya Hidup & Hobi", allocated: 2000000, spent: 0, icon: "🛹" }
  ];
}

export function getBlankBudgets(): Budget[] {
  return [
    { category: "Makanan & Kopi", allocated: 0, spent: 0, icon: "☕" },
    { category: "Tech Bloat & Tools", allocated: 0, spent: 0, icon: "💻" },
    { category: "Kebutuhan Rumah", allocated: 0, spent: 0, icon: "🏠" },
    { category: "Investasi & Tabungan", allocated: 0, spent: 0, icon: "📈" },
    { category: "Gaya Hidup & Hobi", allocated: 0, spent: 0, icon: "🛹" }
  ];
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingRate: number;
}

export function calculateMetrics(transactions: Transaction[]): FinancialMetrics {
  const totalIncome = transactions
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalExpense,
    netBalance,
    savingRate
  };
}

export interface CompoundResult {
  totalValue: number;
  totalInvested: number;
  interestEarned: number;
}

export function calculateCompoundInterest(
  principal: number,
  monthlyContribution: number,
  interestRate: number,
  duration: number
): CompoundResult {
  let currentPrincipal = principal;
  const r = interestRate / 100 / 12; // Monthly rate
  const months = duration * 12;
  let totalInvested = principal;

  for (let i = 0; i < months; i++) {
    currentPrincipal = (currentPrincipal + monthlyContribution) * (1 + r);
    totalInvested += monthlyContribution;
  }

  const interestEarned = currentPrincipal - totalInvested;

  return {
    totalValue: Math.round(currentPrincipal),
    totalInvested: Math.round(totalInvested),
    interestEarned: Math.round(interestEarned)
  };
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(num);
}

export interface CSVData {
  headers: string[];
  rows: any[][];
}

export function generateCSVData(transactions: Transaction[]): CSVData {
  const headers = ["ID", "Tanggal", "Deskripsi", "Kategori", "Arus Kas", "Nominal (IDR)"];
  const rows = transactions.map(tx => [
    tx.id,
    tx.date,
    tx.description,
    tx.category,
    tx.type === "income" ? "INFLOW" : "OUTFLOW",
    tx.amount
  ]);
  return { headers, rows };
}

export function serializeCSVData(csvData: CSVData): string {
  const headerLine = csvData.headers.join(",");
  const rowLines = csvData.rows.map(row => {
    return row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(",");
  });
  return [headerLine, ...rowLines].join("\n");
}

export function exportToCSV(transactions: Transaction[]): boolean {
  if (transactions.length === 0) {
    alert("Ledger transaksi kosong! Tidak ada data untuk diekspor.");
    return false;
  }

  const csvData = generateCSVData(transactions);
  const csvContent = serializeCSVData(csvData);

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `SempruL_Finance_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
}

export function getNextOccurrenceDate(startDateStr: string, interval: "daily" | "weekly" | "monthly" | "yearly"): string {
  const start = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Clear time for accurate day-only comparison

  let next = new Date(start);
  
  // If the next occurrence is in the future, return it
  if (next >= today) {
    return next.toISOString().split('T')[0];
  }

  // Otherwise, increment until we get to a date >= today
  let safetyCounter = 0;
  while (next < today && safetyCounter < 1000) {
    safetyCounter++;
    if (interval === "daily") {
      next.setDate(next.getDate() + 1);
    } else if (interval === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (interval === "monthly") {
      next.setMonth(next.getMonth() + 1);
    } else if (interval === "yearly") {
      next.setFullYear(next.getFullYear() + 1);
    }
  }

  return next.toISOString().split('T')[0];
}

export function getMonthlyTrends(transactions: Transaction[]): { month: string; key: string; Income: number; Expense: number }[] {
  const trends: { [key: string]: { Income: number; Expense: number } } = {};
  
  transactions.forEach(tx => {
    if (!tx.date) return;
    const parts = tx.date.split("-");
    if (parts.length < 2) return;
    const yearMonth = `${parts[0]}-${parts[1]}`;
    
    if (!trends[yearMonth]) {
      trends[yearMonth] = { Income: 0, Expense: 0 };
    }
    
    if (tx.type === "income") {
      trends[yearMonth].Income += tx.amount;
    } else {
      trends[yearMonth].Expense += tx.amount;
    }
  });

  const sortedKeys = Object.keys(trends).sort();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  return sortedKeys.map(key => {
    const [year, month] = key.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    const readableMonth = `${monthNames[monthIndex]} '${year.slice(2)}`;
    return {
      month: readableMonth,
      key,
      Income: trends[key].Income,
      Expense: trends[key].Expense
    };
  });
}

