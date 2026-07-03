import React from "react";
import { Info } from "lucide-react";
import { motion } from "motion/react";
import { Budget } from "../types";
import { formatRupiah } from "../models/financialModel";

interface BudgetViewProps {
  budgets: Budget[];
  handleUpdateBudgetAllocated: (category: string, value: number) => void;
  triggerAlert: (title: string, message: string) => void;
}

export default function BudgetView({
  budgets,
  handleUpdateBudgetAllocated,
  triggerAlert
}: BudgetViewProps) {
  return (
    <motion.div
      key="budget"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.22 }}
      className="space-y-12"
      id="budgets-root-view"
    >
      {/* Header Title */}
      <div className="border-b-4 border-black pb-6" id="budgets-title-section">
        <span className="bg-black text-[#ABF600] font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1">
          LIMIT CONTROL MANAGER
        </span>
        <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter mt-3">
          BUDGET LIMIT CONTROL
        </h1>
        <p className="text-neutral-600 text-sm md:text-base mt-2">
          Atur batas alokasi anggaran bulanan untuk mengendalikan pengeluaran bocor halus. Geser slider dan pantau persentase penyerapan secara real-time.
        </p>
      </div>

      {/* Budgets Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="budgets-cards-grid">
        {budgets.map(b => {
          const percent = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
          const isOver = b.spent > b.allocated;

          return (
            <div 
              key={b.category}
              id={`budget-card-${b.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className={`border-4 border-black p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between relative bg-white overflow-hidden transition-all duration-300 ${
                isOver ? "border-red-600 ring-2 ring-red-500" : ""
              }`}
            >
              {isOver && (
                <div className="absolute top-0 right-0 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase shadow-[0px_2px_0px_#000000]">
                  OVERBUDGET
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{b.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-lg uppercase tracking-tight">{b.category}</h3>
                    <p className="text-[10px] font-mono text-neutral-400">CATEGORY_LIMIT</p>
                  </div>
                </div>

                {/* Numeric stats */}
                <div className="flex justify-between font-mono text-xs border-y border-neutral-200 py-2">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Terpakai</span>
                    <span className="font-bold text-black">{formatRupiah(b.spent)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Batas Alokasi</span>
                    <span className="font-bold text-[#ABF600] bg-black px-1.5 py-0.2">{formatRupiah(b.allocated)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold font-mono">
                    <span>Saturasi Budget</span>
                    <span className={isOver ? "text-red-600 font-black" : ""}>{percent}%</span>
                  </div>
                  <div className="h-5 bg-neutral-100 border-2 border-black relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      className={`h-full border-r-2 border-black ${
                        isOver ? "bg-red-500" : percent > 80 ? "bg-yellow-400" : "bg-[#ABF600]"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Interactive budget adjustment slider */}
              <div className="mt-6 pt-4 border-t border-neutral-100 space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 flex justify-between">
                  <span>Set Limit Anggaran</span>
                  <span>Max: 10jt</span>
                </label>
                <input 
                  type="range"
                  min="500000"
                  max="10000000"
                  step="500000"
                  value={b.allocated}
                  id={`budget-slider-${b.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onChange={(e) => handleUpdateBudgetAllocated(b.category, parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-100 border border-black rounded-none appearance-none cursor-pointer accent-[#ABF600]"
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* Saving Goals Challenge Simulator box */}
      <div className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_#000000] relative overflow-hidden" id="saving-goals-challenge-banner">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#ABF600] opacity-10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-block bg-[#ABF600] text-black font-mono font-black text-xs px-2.5 py-0.5 uppercase">
            PRO LEVEL SAVING CHALLENGE
          </div>
          <h2 className="font-sans font-black text-3xl uppercase tracking-tighter leading-none">
            Tantangan Hemat: Tekan Pengeluaran di Bawah Alokasi!
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Setiap bulan kamu berhasil menekan pengeluaran di bawah limit alokasi, alokasikan sisa dana tersebut ke <strong>Investasi &amp; Tabungan</strong> untuk melipatgandakan efek pelipat ganda compound interest.
          </p>
          <button 
            id="activate-challenge-btn"
            onClick={() => {
              triggerAlert("TANTANGAN HEMAT", "Tantangan Hemat diaktifkan! Pantau indikator saturasi di atas agar tetap hijau!");
            }}
            className="bg-[#ABF600] text-black border-2 border-black font-extrabold px-6 py-3 uppercase text-xs tracking-wider shadow-[4px_4px_0px_#ffffff] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            Aktifkan Target Bulan Ini
          </button>
        </div>
      </div>

    </motion.div>
  );
}
