import React from "react";
import { Sliders } from "lucide-react";
import { motion } from "motion/react";
import { CompoundResult, formatRupiah } from "../models/financialModel";

interface CalculatorViewProps {
  principal: number;
  setPrincipal: (val: number) => void;
  monthlyContribution: number;
  setMonthlyContribution: (val: number) => void;
  interestRate: number;
  setInterestRate: (val: number) => void;
  duration: number;
  setDuration: (val: number) => void;
  compoundResult: CompoundResult;
  triggerAlert: (title: string, message: string) => void;
}

export default function CalculatorView({
  principal,
  setPrincipal,
  monthlyContribution,
  setMonthlyContribution,
  interestRate,
  setInterestRate,
  duration,
  setDuration,
  compoundResult,
  triggerAlert
}: CalculatorViewProps) {
  return (
    <motion.div
      key="calculator"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.22 }}
      className="space-y-12"
      id="calculator-root-view"
    >
      {/* Header Title */}
      <div className="border-b-4 border-black pb-6" id="calculator-title-section">
        <span className="bg-black text-[#ABF600] font-mono text-xs font-bold uppercase tracking-widest px-2.5 py-1">
          FUTURE PROJECTION SANDBOX
        </span>
        <h1 className="font-sans font-black text-4xl md:text-5xl uppercase tracking-tighter mt-3">
          KALKULATOR COMPOUND INTEREST
        </h1>
        <p className="text-neutral-600 text-sm md:text-base mt-2">
          Simulasikan keajaiban bunga berbunga (compound interest) pada aset investasimu. Sesuaikan input modal awal, iuran bulanan, dan estimasi bunga tahunan.
        </p>
      </div>

      {/* Slider & Input Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="calculator-split-layout">
        
        {/* Inputs Box (Left) */}
        <div className="lg:col-span-6 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-6" id="calculator-variables-inputs">
          <h3 className="font-extrabold text-lg uppercase tracking-tight border-b-2 border-black pb-2 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" /> Set Variabel Investasi
          </h3>

          {/* Principal Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs font-bold">
              <span className="uppercase text-neutral-500">Modal Awal (Principal)</span>
              <span className="bg-neutral-100 border border-black px-1.5">{formatRupiah(principal)}</span>
            </div>
            <input 
              type="range"
              min="1000000"
              max="50000000"
              step="1000000"
              value={principal}
              id="calculator-slider-principal"
              onChange={(e) => setPrincipal(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-[#ABF600]"
            />
          </div>

          {/* Monthly Contribution Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs font-bold">
              <span className="uppercase text-neutral-500">Iuran Bulanan (Contribution)</span>
              <span className="bg-neutral-100 border border-black px-1.5">{formatRupiah(monthlyContribution)}</span>
            </div>
            <input 
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={monthlyContribution}
              id="calculator-slider-contribution"
              onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-[#ABF600]"
            />
          </div>

          {/* Annual Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs font-bold">
              <span className="uppercase text-neutral-500">Estimasi Imbal Hasil (Per Tahun)</span>
              <span className="bg-neutral-100 border border-black px-1.5">{interestRate}% p.a</span>
            </div>
            <input 
              type="range"
              min="2"
              max="25"
              step="1"
              value={interestRate}
              id="calculator-slider-interest"
              onChange={(e) => setInterestRate(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-[#ABF600]"
            />
          </div>

          {/* Investment Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between font-mono text-xs font-bold">
              <span className="uppercase text-neutral-500">Durasi Investasi</span>
              <span className="bg-neutral-100 border border-black px-1.5">{duration} Tahun</span>
            </div>
            <input 
              type="range"
              min="1"
              max="30"
              step="1"
              value={duration}
              id="calculator-slider-duration"
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-[#ABF600]"
            />
          </div>
        </div>

        {/* Simulation Output Display (Right) */}
        <div className="lg:col-span-6 bg-[#ABF600] border-4 border-black p-6 shadow-[8px_8px_0px_#000000] text-black space-y-6" id="calculator-results-panel">
          <div>
            <span className="bg-black text-[#ABF600] font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
              ESTIMASI HASIL INVESTASI
            </span>
            <h2 className="font-sans font-black text-4xl uppercase tracking-tighter mt-2 leading-none">
              AKUMULASI MASSA DEPAN
            </h2>
          </div>

          {/* Large Accumulation Result Display */}
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000000]">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Total Nilai Akhir</span>
            <div className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              {formatRupiah(compoundResult.totalValue)}
            </div>
          </div>

          {/* Sub breakdown details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 border-2 border-black p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[9px] font-mono font-bold text-neutral-500 block uppercase">Total Modal Disetor</span>
              <span className="font-extrabold text-base">{formatRupiah(compoundResult.totalInvested)}</span>
            </div>
            <div className="bg-white/80 border-2 border-black p-3 shadow-[2px_2px_0px_#000000]">
              <span className="text-[9px] font-mono font-bold text-neutral-500 block uppercase">Bunga yang Dihasilkan</span>
              <span className="font-extrabold text-base text-green-700">{formatRupiah(compoundResult.interestEarned)}</span>
            </div>
          </div>

          {/* Compound Interest table preview simulator */}
          <div className="bg-black text-white p-4 font-mono text-[11px] space-y-2 border-2 border-black" id="calculator-timeline-card">
            <div className="text-[#ABF600] font-bold border-b border-neutral-700 pb-1.5 uppercase">
              Timeline Pertumbuhan Aset (Est):
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Tahun ke-0 (Mulai)</span>
              <span>{formatRupiah(principal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tahun ke-{Math.ceil(duration / 2)} (Tengah)</span>
              <span>{formatRupiah(Math.round(principal + (compoundResult.totalValue - principal) / 2))}</span>
            </div>
            <div className="flex justify-between text-[#ABF600] font-bold">
              <span>Tahun ke-{duration} (Target)</span>
              <span>{formatRupiah(compoundResult.totalValue)}</span>
            </div>
          </div>

          {/* Trigger Lock Investment button */}
          <button
            id="lock-target-btn"
            onClick={() => {
              triggerAlert(
                "TARGET INVESTASI DIKUNCI",
                `Variabel Investasi dikunci! Modal awal: ${formatRupiah(principal)} dengan setoran bulanan ${formatRupiah(monthlyContribution)} selama ${duration} tahun akan menghasilkan ${formatRupiah(compoundResult.totalValue)}.\n\nMulai sisihkan sekarang!`
              );
            }}
            className="w-full bg-black text-white py-3 border-2 border-black font-bold uppercase text-xs tracking-wider shadow-[4px_4px_0px_#ffffff] hover:translate-y-[2.5px] hover:shadow-none transition-all active:translate-y-[4px] cursor-pointer"
          >
            Kunci Target &amp; Buat Alokasi
          </button>

        </div>

      </div>

    </motion.div>
  );
}
