import React, { useState } from "react";
import { Download, Search, Plus, Trash2, RotateCcw, Info, AlertTriangle, Trash, Calendar, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction, DeletedTransaction } from "../types";
import { formatRupiah, DEFAULT_CATEGORIES, getNextOccurrenceDate } from "../models/financialModel";

interface TransactionsViewProps {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  filterType: "All" | "income" | "expense";
  setFilterType: (val: "All" | "income" | "expense") => void;
  sortBy: "date" | "amount";
  setSortBy: (val: "date" | "amount") => void;
  txDesc: string;
  setTxDesc: (val: string) => void;
  txAmount: string;
  setTxAmount: (val: string) => void;
  txCategory: string;
  setTxCategory: (val: string) => void;
  txType: "income" | "expense";
  setTxType: (val: "income" | "expense") => void;
  txDate: string;
  setTxDate: (val: string) => void;
  txIsRecurring: boolean;
  setTxIsRecurring: (val: boolean) => void;
  txRecurringInterval: "daily" | "weekly" | "monthly" | "yearly";
  setTxRecurringInterval: (val: "daily" | "weekly" | "monthly" | "yearly") => void;
  handleMainAddSubmit: (e: React.FormEvent) => void;
  handleDeleteTransaction: (id: string) => void;
  handleExportCSV: () => void;
  handleUpdateRecurringStatus: (id: string, isRecurring: boolean, interval?: "daily" | "weekly" | "monthly" | "yearly") => void;
  handlePayUpcoming: (tx: Transaction) => void;
  
  // Trash Bin / Deleted History Props
  deletedTransactions: DeletedTransaction[];
  handleRestoreTransaction: (id: string) => void;
  handlePermanentDeleteTransaction: (id: string) => void;
  handleClearTrash: () => void;
}


export default function TransactionsView({
  transactions,
  filteredTransactions,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  txDesc,
  setTxDesc,
  txAmount,
  setTxAmount,
  txCategory,
  setTxCategory,
  txType,
  setTxType,
  txDate,
  setTxDate,
  txIsRecurring,
  setTxIsRecurring,
  txRecurringInterval,
  setTxRecurringInterval,
  handleMainAddSubmit,
  handleDeleteTransaction,
  handleExportCSV,
  handleUpdateRecurringStatus,
  handlePayUpcoming,
  
  // Trash Bin
  deletedTransactions,
  handleRestoreTransaction,
  handlePermanentDeleteTransaction,
  handleClearTrash
}: TransactionsViewProps) {
  return (
    <motion.div
      key="transactions"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.22 }}
      className="space-y-8"
      id="transactions-root-view"
    >
      {/* Header Title */}
      <div className="border-b-4 border-black pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6" id="transactions-title-row">
        <div>
          <span className="bg-black text-[#ABF600] font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1">
            SECURE LEDGER RECORD
          </span>
          <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter mt-3">
            LEDGER TRANSAKSI UTAMA
          </h1>
          <p className="text-neutral-600 text-sm md:text-base mt-2">
            Daftar mutasi rekening keuangan yang dicatat secara real-time. Gunakan filter pencarian untuk mengaudit secara mendalam.
          </p>
        </div>

        <button
          id="export-csv-ledger-btn"
          onClick={handleExportCSV}
          className="bg-[#ABF600] text-black border-4 border-black px-5 py-3 font-extrabold uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[4px] active:translate-y-[4px] flex items-center gap-2 shrink-0 self-start md:self-end cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export CSV Ledger
        </button>
      </div>

      {/* Filtering Dashboard Block */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-6" id="ledger-filters-panel">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              id="ledger-search-input"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 pl-9 font-mono text-xs uppercase shadow-[2px_2px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] outline-none"
            />
          </div>

          {/* Category select filter */}
          <div className="md:col-span-3">
            <select
              id="ledger-category-filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none appearance-none cursor-pointer"
            >
              <option value="All">SEMUA KATEGORI</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Type Filter select */}
          <div className="md:col-span-3">
            <select
              id="ledger-type-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none appearance-none cursor-pointer"
            >
              <option value="All">SEMUA STATUS KAS</option>
              <option value="income">PENDAPATAN (INFLOW)</option>
              <option value="expense">PENGELUARAN (OUTFLOW)</option>
            </select>
          </div>

          {/* Sorting Filter select */}
          <div className="md:col-span-2">
            <select
              id="ledger-sort-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none appearance-none cursor-pointer"
            >
              <option value="date">SORT BY TANGGAL</option>
              <option value="amount">SORT BY NOMINAL</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden" id="ledger-data-table-container">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="bg-black text-white font-mono text-xs font-bold tracking-wider uppercase border-b-2 border-black select-none">
                <th className="p-4 border-r border-black/20">Tanggal</th>
                <th className="p-4 border-r border-black/20">Deskripsi</th>
                <th className="p-4 border-r border-black/20">Kategori</th>
                <th className="p-4 border-r border-black/20">Arus Kas</th>
                <th className="p-4 border-r border-black/20 text-right">Nominal (IDR)</th>
                <th className="p-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-mono text-xs">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} id={`ledger-row-${tx.id}`} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 border-r border-black/20 whitespace-nowrap">{tx.date}</td>
                  <td className="p-4 border-r border-black/20 font-sans text-sm text-black">
                    <div className="font-bold">{tx.description}</div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <select
                        value={tx.isRecurring ? tx.recurringInterval || "monthly" : "none"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "none") {
                            handleUpdateRecurringStatus(tx.id, false);
                          } else {
                            handleUpdateRecurringStatus(tx.id, true, val as any);
                          }
                        }}
                        className="bg-neutral-50 border border-black px-1.5 py-0.5 font-mono text-[9px] uppercase font-bold focus:outline-none cursor-pointer shadow-[1.5px_1.5px_0px_#000000] hover:bg-[#ABF600]/10"
                        title="Ubah status pengulangan transaksi"
                      >
                        <option value="none">Siklus: Non-Berulang</option>
                        <option value="daily">🔁 Harian</option>
                        <option value="weekly">🔁 Mingguan</option>
                        <option value="monthly">🔁 Bulanan</option>
                        <option value="yearly">🔁 Tahunan</option>
                      </select>
                      {tx.isRecurring && (
                        <span className="bg-black text-[#ABF600] px-1 py-0.5 rounded-sm font-mono text-[8px] font-bold tracking-wider" title="Next occurrence date">
                          JADWAL: {getNextOccurrenceDate(tx.date, tx.recurringInterval || "monthly")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-r border-black/20 whitespace-nowrap">
                    <span className="bg-neutral-100 border border-black/30 px-2.5 py-1 uppercase text-[10px] font-bold">
                      {tx.category}
                    </span>
                  </td>
                  <td className="p-4 border-r border-black/20 whitespace-nowrap">
                    <span className={`inline-block border-2 border-black px-2 py-0.5 font-bold uppercase text-[9px] shadow-[1px_1px_0px_#000000] ${
                      tx.type === "income" ? "bg-[#ABF600] text-black" : "bg-red-400 text-white"
                    }`}>
                      {tx.type === "income" ? "INFLOW" : "OUTFLOW"}
                    </span>
                  </td>
                  <td className={`p-4 border-r border-black/20 text-right font-black text-sm whitespace-nowrap ${
                    tx.type === "income" ? "text-green-600" : "text-black"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      id={`delete-ledger-tx-btn-${tx.id}`}
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="bg-red-100 hover:bg-red-500 hover:text-white border border-black p-1.5 transition-colors shadow-[1px_1px_0px_#000000] active:translate-y-[1px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-neutral-500 font-bold italic uppercase">
                    Tidak ditemukan data transaksi yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION: UPCOMING SCHEDULED PAYMENTS */}
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000000] space-y-4" id="upcoming-payments-panel">
        <h3 className="font-extrabold text-xl uppercase tracking-tight flex items-center gap-2 border-b-2 border-black pb-2">
          <Calendar className="w-5 h-5 bg-[#ABF600] border border-black text-black" />
          Pembayaran Berulang &amp; Tagihan Mendatang
        </h3>
        
        <p className="text-xs text-neutral-600 font-mono">
          Daftar rencana arus kas terjadwal Anda yang ditandai sebagai <strong>berulang</strong>. Anda dapat mencatat pengeluaran/pendapatan tersebut secara otomatis ke Ledger cashflow dengan menekan tombol bayar.
        </p>

        {transactions.filter(tx => tx.isRecurring).length === 0 ? (
          <div className="p-6 border-2 border-dashed border-neutral-300 text-center font-mono text-xs text-neutral-500 uppercase">
            Belum ada transaksi yang ditandai sebagai berulang. Gunakan Form Pendaftaran Manual di bawah atau ubah status transaksi di Ledger untuk membuat jadwal pengulangan.
          </div>
        ) : (
          <div className="overflow-x-auto border-2 border-black">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black font-mono text-xs font-bold uppercase select-none text-black">
                  <th className="p-3 border-r border-black/20">Nama Transaksi</th>
                  <th className="p-3 border-r border-black/20">Kategori</th>
                  <th className="p-3 border-r border-black/20">Siklus</th>
                  <th className="p-3 border-r border-black/20">Jadwal Berikutnya</th>
                  <th className="p-3 border-r border-black/20 text-right">Nominal</th>
                  <th className="p-3 text-center">Aksi Pelunasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/20 font-mono text-xs">
                {transactions
                  .filter(tx => tx.isRecurring)
                  .map(tx => {
                    const nextDate = getNextOccurrenceDate(tx.date, tx.recurringInterval || "monthly");
                    return { ...tx, nextDate };
                  })
                  .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
                  .map(tx => (
                    <tr key={tx.id} className="hover:bg-neutral-50">
                      <td className="p-3 border-r border-black/20 font-sans font-bold text-sm text-black">{tx.description}</td>
                      <td className="p-3 border-r border-black/20">
                        <span className="bg-white border border-black px-2 py-0.5 text-[9px] font-bold uppercase">
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-3 border-r border-black/20">
                        <span className="inline-flex items-center gap-1 bg-[#ABF600]/25 text-black border border-black/40 px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> {tx.recurringInterval}
                        </span>
                      </td>
                      <td className="p-3 border-r border-black/20 font-bold text-neutral-800 whitespace-nowrap">
                        📅 {tx.nextDate}
                      </td>
                      <td className={`p-3 border-r border-black/20 text-right font-black text-sm ${
                        tx.type === "income" ? "text-green-600" : "text-black"
                      }`}>
                        {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handlePayUpcoming(tx)}
                            className="bg-[#ABF600] hover:bg-[#96d900] text-black border border-black px-2.5 py-1 font-bold text-[10px] uppercase shadow-[1px_1px_0px_#000000] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            title="Konfirmasi Pembayaran dan Catat di Ledger"
                          >
                            Bayar Sekarang
                          </button>
                          <button
                            onClick={() => handleUpdateRecurringStatus(tx.id, false)}
                            className="bg-neutral-100 hover:bg-neutral-200 text-black border border-black px-2 py-1 font-bold text-[10px] uppercase shadow-[1px_1px_0px_#000000] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                            title="Hentikan pengulangan transaksi ini"
                          >
                            Non-aktifkan
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section to Record a New Large Transaction Entry */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] max-w-2xl" id="manual-logger-card-panel">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
          <Plus className="w-5 h-5 bg-[#ABF600] border border-black text-black" />
          Form Pendaftaran Transaksi Manual
        </h3>

        <form onSubmit={handleMainAddSubmit} className="space-y-4" id="manual-logger-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold uppercase">Deskripsi Transaksi *</label>
              <input 
                type="text" 
                id="manual-tx-desc-input"
                required 
                value={txDesc}
                onChange={(e) => setTxDesc(e.target.value)}
                placeholder="Contoh: Langganan Adobe Creative"
                className="bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold uppercase">Nominal Rupiah (IDR) *</label>
              <input 
                type="number" 
                id="manual-tx-amount-input"
                required 
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="350000"
                className="bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold uppercase">Tanggal Transaksi</label>
              <input 
                type="date" 
                id="manual-tx-date-input"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold uppercase">Arus Kas</label>
              <select 
                id="manual-tx-type-select"
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                className="bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none appearance-none cursor-pointer"
              >
                <option value="expense">PENGELUARAN (OUTFLOW)</option>
                <option value="income">PENDAPATAN (INFLOW)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono font-bold uppercase">Kategori Alokasi</label>
              <select 
                id="manual-tx-category-select"
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="bg-white border-2 border-black p-2.5 font-mono text-xs shadow-[2px_2px_0px_#000000] outline-none appearance-none cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Option to mark as recurring */}
          <div className="bg-neutral-50 border-2 border-black p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="manual-tx-recurring-checkbox"
                checked={txIsRecurring}
                onChange={(e) => setTxIsRecurring(e.target.checked)}
                className="w-4 h-4 border-2 border-black rounded text-black bg-white focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold uppercase text-neutral-800">Tandai sebagai Transaksi Berulang (Recurring)</span>
            </label>

            {txIsRecurring && (
              <div className="pl-6 space-y-1.5 max-w-sm">
                <label className="block text-[11px] font-mono font-bold uppercase text-neutral-500">Interval Pengulangan Tagihan / Kas</label>
                <select
                  id="manual-tx-recurring-interval-select"
                  value={txRecurringInterval}
                  onChange={(e) => setTxRecurringInterval(e.target.value as any)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs shadow-[2px_2px_0px_#000000] focus:shadow-[3px_3px_0px_#000000] outline-none cursor-pointer"
                >
                  <option value="daily">🔁 HARIAN (DAILY)</option>
                  <option value="weekly">🔁 MINGGUAN (WEEKLY)</option>
                  <option value="monthly">🔁 BULANAN (MONTHLY)</option>
                  <option value="yearly">🔁 TAHUNAN (YEARLY)</option>
                </select>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            id="manual-tx-submit-btn"
            className="bg-[#ABF600] text-black border-2 border-black px-6 py-2.5 font-bold uppercase text-xs shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            Kirim &amp; Catat Transaksi
          </button>
        </form>
      </div>

      {/* TRASH BIN SECTION */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_#000000] space-y-4 p-6" id="trash-bin-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-3 gap-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-red-100 border-2 border-black text-red-600 font-extrabold flex items-center justify-center shadow-[1px_1px_0px_#000000]">
              🗑️
            </span>
            <div>
              <h3 className="font-extrabold text-xl uppercase tracking-tight">
                Keranjang Sampah Offline ({deletedTransactions.length})
              </h3>
              <p className="text-neutral-500 font-mono text-[10px] uppercase font-bold tracking-wider">
                Offline Trash Recovery System
              </p>
            </div>
          </div>
          
          <button
            type="button"
            id="clear-all-trash-btn"
            onClick={handleClearTrash}
            disabled={deletedTransactions.length === 0}
            className={`border-2 border-black font-extrabold px-4 py-2 uppercase text-[10px] tracking-wider transition-all shadow-[2px_2px_0px_#000000] active:translate-y-[1px] active:shadow-none cursor-pointer ${
              deletedTransactions.length === 0
                ? "bg-neutral-100 text-neutral-400 border-neutral-300 shadow-none cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            Kosongkan Sampah
          </button>
        </div>

        {/* Informative explanation of where history is stored */}
        <div className="bg-[#ABF600]/10 border-2 border-black p-4 text-xs space-y-2">
          <div className="flex items-start gap-2 text-neutral-700">
            <Info className="w-4.5 h-4.5 text-black shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Informasi Penyimpanan Offline:</span> Semua riwayat transaksi yang Anda hapus tidak benar-benar musnah seketika. Transaksi dipindahkan ke wadah sampah ini dan disimpan murni di memori lokal peramban Anda (<strong>Browser LocalStorage</strong>) pada kunci digital: <code className="bg-black text-[#ABF600] px-1.5 py-0.5 font-mono text-[10px] font-bold">"semprul_deleted_history"</code>. Hal ini menjamin privasi keuangan mutlak karena data Anda tidak pernah menyentuh server luar mana pun!
            </div>
          </div>
        </div>

        {/* Deleted List */}
        {deletedTransactions.length > 0 ? (
          <div className="border-2 border-black overflow-x-auto shadow-[3px_3px_0px_#000000]">
            <table className="w-full min-w-[600px] text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black font-bold text-neutral-600 uppercase text-[10px] select-none">
                  <th className="p-3 border-r border-black/20">Waktu Hapus</th>
                  <th className="p-3 border-r border-black/20">Deskripsi / Kategori</th>
                  <th className="p-3 border-r border-black/20">Nominal</th>
                  <th className="p-3 text-center">Aksi Pemulihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {deletedTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-neutral-50 transition-colors" id={`trash-row-${tx.id}`}>
                    <td className="p-3 border-r border-black/20 whitespace-nowrap text-neutral-400 text-[10px]">
                      {new Date(tx.deletedAt).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="p-3 border-r border-black/20">
                      <div className="font-sans font-bold text-neutral-800">{tx.description}</div>
                      <span className="inline-block bg-neutral-100 border border-neutral-300 px-1.5 py-0.2 uppercase text-[9px] text-neutral-500 font-semibold mt-0.5">
                        {tx.category}
                      </span>
                    </td>
                    <td className={`p-3 border-r border-black/20 font-bold whitespace-nowrap ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          type="button"
                          id={`restore-trash-btn-${tx.id}`}
                          onClick={() => handleRestoreTransaction(tx.id)}
                          className="bg-white hover:bg-[#ABF600] text-black border border-black px-2.5 py-1 text-[10px] font-extrabold uppercase shadow-[1px_1px_0px_#000000] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
                          title="Restore to Ledger"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Pulihkan
                        </button>
                        <button
                          type="button"
                          id={`destroy-trash-btn-${tx.id}`}
                          onClick={() => handlePermanentDeleteTransaction(tx.id)}
                          className="bg-red-50 hover:bg-red-600 text-white border border-black p-1 shadow-[1px_1px_0px_#000000] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer flex items-center justify-center h-6 w-7"
                          title="Hapus Permanen"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-400 italic font-bold border-2 border-dashed border-neutral-300 uppercase text-xs select-none">
            Keranjang sampah kosong. Tidak ada riwayat transaksi terhapus yang tercatat.
          </div>
        )}
      </div>

    </motion.div>
  );
}
