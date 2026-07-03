import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Terminal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2, 
  Info, 
  Check 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Transaction } from "../types";
import { 
  formatRupiah, 
  DEFAULT_CATEGORIES, 
  FinancialMetrics, 
  getMonthlyTrends 
} from "../models/financialModel";

const formatYAxisValue = (value: number) => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)}rb`;
  }
  return `Rp ${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-black p-3 shadow-[3px_3px_0px_#000000] font-mono text-xs">
        <p className="font-extrabold mb-1 uppercase border-b border-black pb-1">{label}</p>
        <p className="text-green-600 font-bold">INFLOW: {formatRupiah(payload[0].value)}</p>
        <p className="text-red-600 font-bold mt-0.5">OUTFLOW: {formatRupiah(payload[1].value)}</p>
        <p className="text-neutral-700 font-black mt-1.5 pt-1 border-t border-dashed border-black/30">
          NET: {formatRupiah((payload[0].value || 0) - (payload[1].value || 0))}
        </p>
      </div>
    );
  }
  return null;
};


interface OverviewViewProps {
  metrics: FinancialMetrics;
  transactions: Transaction[];
  quickTxDesc: string;
  setQuickTxDesc: (val: string) => void;
  quickTxAmount: string;
  setQuickTxAmount: (val: string) => void;
  quickTxCategory: string;
  setQuickTxCategory: (val: string) => void;
  quickTxType: "income" | "expense";
  setQuickTxType: (val: "income" | "expense") => void;
  quickTxSuccess: boolean;
  handleQuickAddSubmit: (e: React.FormEvent) => void;
  handleDeleteTransaction: (id: string) => void;
  setActiveTab: (tab: "overview" | "transactions" | "budget" | "calculator") => void;
}

export default function OverviewView({
  metrics,
  transactions,
  quickTxDesc,
  setQuickTxDesc,
  quickTxAmount,
  setQuickTxAmount,
  quickTxCategory,
  setQuickTxCategory,
  quickTxType,
  setQuickTxType,
  quickTxSuccess,
  handleQuickAddSubmit,
  handleDeleteTransaction,
  setActiveTab
}: OverviewViewProps) {
  const { totalIncome, totalExpense, netBalance, savingRate } = metrics;
  const monthlyData = getMonthlyTrends(transactions);

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.22 }}
      className="space-y-12"
      id="overview-root-view"
    >
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-black pb-8" id="overview-title-section">
        <div>
          <span className="inline-block bg-[#ABF600] border-2 border-black px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#000000]">
            🔥 REAL-TIME LEDGER OVERVIEW
          </span>
          <h1 className="font-sans font-black text-4xl md:text-6xl uppercase tracking-tighter">
            MONITOR AMUNISI KEUANGANMU.
          </h1>
          <p className="text-neutral-600 max-w-2xl text-sm md:text-base mt-2">
            Lacak setiap rupiah masuk dan keluar tanpa bias, pangkas pengeluaran impulsif, dan alokasikan tabungan dengan presisi brutal.
          </p>
        </div>

        {/* Savings Streak Highlight */}
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_#000000] flex items-center gap-4 min-w-[240px] rotate-1" id="savings-rate-badge">
          <div className="bg-[#ABF600] p-3 border-2 border-black shadow-[2px_2px_0px_#000000]">
            <TrendingUp className="w-8 h-8 text-black" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Savings Rate</span>
            <div className="text-2xl font-black">{savingRate}%</div>
            <span className="text-[10px] font-mono text-green-600 font-bold uppercase">Healthy Buffer</span>
          </div>
        </div>
      </div>

      {/* Three-Column Brutalist Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="three-column-metrics-grid">
        
        {/* Total Balance Card */}
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] relative overflow-hidden flex flex-col justify-between h-44 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000] transition-all" id="net-balance-metric-card">
          <div className="absolute -right-4 -top-4 opacity-5 text-black group-hover:scale-110 transition-transform">
            <Wallet className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs font-bold uppercase text-neutral-500">Saldo Net Bersih</span>
            <span className="bg-neutral-100 border border-black px-2 py-0.5 font-mono text-[10px] font-bold">LIVE METRIC</span>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none break-all">
              {formatRupiah(netBalance)}
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-1 uppercase">Sisa likuiditas saat ini</p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="bg-[#ABF600]/15 border-4 border-black p-6 shadow-[6px_6px_0px_#000000] relative overflow-hidden flex flex-col justify-between h-44 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000] transition-all" id="total-income-metric-card">
          <div className="absolute -right-4 -top-4 opacity-5 text-green-700 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs font-bold uppercase text-neutral-500">Total Pendapatan</span>
            <span className="bg-[#ABF600] border border-black px-2 py-0.5 font-mono text-[10px] font-bold text-black">INFLOW</span>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-green-700 break-all">
              {formatRupiah(totalIncome)}
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-1 uppercase">Arus kas masuk bulan ini</p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-red-50 border-4 border-black p-6 shadow-[6px_6px_0px_#000000] relative overflow-hidden flex flex-col justify-between h-44 group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000] transition-all" id="total-expense-metric-card">
          <div className="absolute -right-4 -top-4 opacity-5 text-red-700 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-xs font-bold uppercase text-neutral-500">Total Pengeluaran</span>
            <span className="bg-red-200 border border-black px-2 py-0.5 font-mono text-[10px] font-bold text-red-800">OUTFLOW</span>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-red-600 break-all">
              {formatRupiah(totalExpense)}
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-1 uppercase">Kehilangan modal / konsumsi</p>
          </div>
        </div>

      </div>

      {/* Monthly Trends Recharts Bar Chart */}
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000000] space-y-6" id="monthly-trends-chart-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <span className="inline-block bg-[#ABF600] border border-black px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] mb-1">
              📊 DATA VISUALIZATION
            </span>
            <h3 className="font-extrabold text-xl uppercase tracking-tight flex items-center gap-2">
              Tren Arus Kas Bulanan (Inflow vs Outflow)
            </h3>
            <p className="text-xs text-neutral-600 font-mono">
              Perbandingan total Pendapatan (Inflow) dan total Pengeluaran (Outflow) Anda secara bulanan.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 bg-[#ABF600] border-2 border-black inline-block shadow-[1px_1px_0px_#000000]"></span>
              INFLOW (IN)
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 bg-[#FF4B4B] border-2 border-black inline-block shadow-[1px_1px_0px_#000000]"></span>
              OUTFLOW (OUT)
            </span>
          </div>
        </div>

        {monthlyData.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-black/30 text-center font-mono text-xs text-neutral-500 uppercase">
            Belum ada data bulanan untuk ditampilkan. Silakan catat transaksi di bawah untuk memetakan tren.
          </div>
        ) : (
          <div className="h-80 w-full" id="monthly-trends-barchart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={0.12} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#000000"
                  tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: "bold", fill: "#000000" }}
                  tickLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                />
                <YAxis 
                  stroke="#000000"
                  tickFormatter={formatYAxisValue}
                  tick={{ fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: "bold", fill: "#000000" }}
                  tickLine={{ stroke: "#000000", strokeWidth: 1.5 }}
                  axisLine={{ stroke: "#000000", strokeWidth: 2 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#000000", fillOpacity: 0.05 }} />
                <Bar 
                  dataKey="Income" 
                  name="Pendapatan" 
                  fill="#ABF600" 
                  stroke="#000000" 
                  strokeWidth={2}
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="Expense" 
                  name="Pengeluaran" 
                  fill="#FF4B4B" 
                  stroke="#000000" 
                  strokeWidth={2}
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid: Quick Add & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6" id="overview-loggers-and-recent-ledger">
        
        {/* Left: Quick Transaction logger */}
        <div className="lg:col-span-5 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000]" id="quick-transaction-card-panel">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
            <h3 className="font-extrabold text-xl uppercase tracking-tight flex items-center gap-2">
              <Plus className="w-5 h-5 text-black bg-[#ABF600] border border-black" />
              Catat Transaksi Instan
            </h3>
            <span className="font-mono text-[10px] text-neutral-400">QUICK_LOGGER</span>
          </div>

          <form onSubmit={handleQuickAddSubmit} className="space-y-4" id="quick-logger-form">
                      {/* Switch Income / Expense */}
            <div className="grid grid-cols-2 gap-3 border-2 border-black p-1 bg-neutral-100" id="quick-logger-type-switcher">
              <button
                type="button"
                id="quick-logger-btn-expense"
                onClick={() => setQuickTxType("expense")}
                className={`py-2 text-xs font-bold uppercase border border-transparent transition-all cursor-pointer ${
                  quickTxType === "expense" 
                    ? "bg-red-500 text-white border-black shadow-[2px_2px_0px_#000000]" 
                    : "bg-transparent text-neutral-600"
                }`}
              >
                Pengeluaran (Out)
              </button>
              <button
                type="button"
                id="quick-logger-btn-income"
                onClick={() => setQuickTxType("income")}
                className={`py-2 text-xs font-bold uppercase border border-transparent transition-all cursor-pointer ${
                  quickTxType === "income" 
                    ? "bg-[#ABF600] text-black border-black shadow-[2px_2px_0px_#000000]" 
                    : "bg-transparent text-neutral-600"
                }`}
              >
                Pendapatan (In)
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase">Deskripsi Transaksi *</label>
              <input 
                type="text" 
                id="quick-tx-desc-input"
                required
                placeholder="Contoh: Kopi Es Americano, Gaji Freelance"
                value={quickTxDesc}
                onChange={(e) => setQuickTxDesc(e.target.value)}
                className="bg-white border-2 border-black p-3 font-mono text-sm shadow-[2px_2px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_#000000] transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase">Jumlah Rupiah (IDR) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-extrabold text-neutral-500">RP</span>
                <input 
                  type="number"
                  id="quick-tx-amount-input"
                  required
                  placeholder="65000"
                  value={quickTxAmount}
                  onChange={(e) => setQuickTxAmount(e.target.value)}
                  className="w-full bg-white border-2 border-black p-3 pl-9 font-mono text-sm shadow-[2px_2px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_#000000] transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold uppercase">Kategori</label>
              <select
                id="quick-tx-category-select"
                value={quickTxCategory}
                onChange={(e) => setQuickTxCategory(e.target.value)}
                className="bg-white border-2 border-black p-3 font-mono text-sm shadow-[2px_2px_0px_#000000] focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[4px_4px_0px_#000000] transition-all outline-none appearance-none cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              id="quick-tx-submit-btn"
              className="w-full bg-black text-white border-2 border-black py-3.5 font-bold uppercase text-xs tracking-wider shadow-[4px_4px_0px_#ABF600] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[4px] active:translate-y-[4px] cursor-pointer"
            >
              Mulai Catat Transaksi
            </button>

            <AnimatePresence>
              {quickTxSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-green-50 border-2 border-green-600 text-green-800 font-mono text-xs flex items-center gap-2"
                  id="quick-tx-success-toast"
                >
                  <Check className="w-4 h-4 text-green-700" />
                  Sukses mencatat! Saldo & ledger terupdate otomatis.
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        </div>

        {/* Right: Recent Ledger Log */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between" id="recent-ledger-logs-panel">
          <div>
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-6">
              <h3 className="font-extrabold text-xl uppercase tracking-tight flex items-center gap-2">
                <Terminal className="w-5 h-5 text-black bg-[#ABF600] border border-black" />
                Log Ledger Keuangan Terbaru
              </h3>
              <button 
                id="view-all-ledger-logs-btn"
                onClick={() => setActiveTab("transactions")}
                className="text-xs font-mono font-bold text-neutral-500 hover:text-black underline cursor-pointer"
              >
                VIEW_ALL
              </button>
            </div>

            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1" id="recent-transactions-list">
              {transactions.slice(0, 5).map(tx => (
                <div 
                  key={tx.id}
                  id={`recent-tx-item-${tx.id}`}
                  className="flex items-center justify-between p-3.5 border-2 border-black hover:bg-neutral-50 shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 border border-black shadow-[1px_1px_0px_#000000] ${
                      tx.type === "income" ? "bg-[#ABF600]" : "bg-red-100"
                    }`}>
                      {tx.type === "income" ? (
                        <ArrowUpRight className="w-4 h-4 text-black" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-700" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-black uppercase leading-tight">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono bg-neutral-100 border border-neutral-300 px-1 py-0.2 font-bold text-neutral-600">
                          {tx.category}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-black ${
                      tx.type === "income" ? "text-green-600" : "text-black"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </span>
                    <button 
                      id={`delete-recent-tx-${tx.id}`}
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-10 font-mono text-sm text-neutral-500 italic" id="empty-recent-tx-indicator">
                  Belum ada transaksi tercatat. Coba isi form di kiri untuk simulasi!
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Alert if Expense exceeds specific budgets */}
          <div className="mt-6 p-4 bg-[#ABF600]/10 border-2 border-black flex gap-3" id="financial-strategy-tip-panel">
            <Info className="w-5 h-5 text-black shrink-0" />
            <p className="text-xs text-neutral-700 leading-normal">
              <strong>Strategi Finansial:</strong> Gunakan tab <strong>Kalkulator Compound</strong> untuk merencanakan tabungan jangka panjang, serta disiplin memantau alokasi anggaran bulanan Anda.
            </p>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
