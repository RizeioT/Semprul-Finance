import React, { useState, useEffect } from "react";
import { X, Download, FileSpreadsheet, Code, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CSVData, serializeCSVData, formatRupiah } from "../models/financialModel";

interface CsvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  csvData: CSVData | null;
  onConfirmDownload: () => void;
}

export default function CsvPreviewModal({
  isOpen,
  onClose,
  csvData,
  onConfirmDownload
}: CsvPreviewModalProps) {
  const [activeView, setActiveView] = useState<"table" | "raw">("table");
  const [copied, setCopied] = useState(false);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!csvData) return null;

  const rawCSVString = serializeCSVData(csvData);
  const estimatedFileName = `SempruL_Finance_Ledger_${new Date().toISOString().split('T')[0]}.csv`;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawCSVString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="csv-preview-overlay">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
            id="csv-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="relative bg-white w-full max-w-4xl border-4 border-black shadow-[8px_8px_0px_#000000] z-10 flex flex-col max-h-[85vh] overflow-hidden"
            id="csv-preview-modal"
          >
            
            {/* Header */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-black select-none" id="csv-modal-header">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-[#ABF600]" />
                <span className="font-sans font-black uppercase tracking-tight text-lg">
                  Audit Preview Data Ekspor CSV
                </span>
              </div>
              <button 
                id="csv-modal-close-btn"
                onClick={onClose}
                className="p-1 hover:bg-neutral-800 border border-transparent hover:border-neutral-700 transition-all text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Info Panel */}
            <div className="bg-neutral-100 border-b-2 border-black px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono select-none" id="csv-summary-row">
              <div className="flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase font-bold text-[10px]">Estimasi Nama File:</span>
                <span className="text-black font-extrabold truncate" title={estimatedFileName}>
                  {estimatedFileName}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase font-bold text-[10px]">Total Baris Data:</span>
                <span className="text-black font-extrabold">
                  {csvData.rows.length} Transaksi (+1 Baris Header)
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-neutral-500 uppercase font-bold text-[10px]">Standar Encoding:</span>
                <span className="text-[#ABF600] bg-black px-1.5 py-0.5 font-extrabold self-start text-[10px]">
                  UTF-8 / RFC-4180
                </span>
              </div>
            </div>

            {/* View Tab Switchers */}
            <div className="flex border-b-2 border-black bg-neutral-50" id="csv-tabs">
              <button
                id="csv-tab-table"
                onClick={() => setActiveView("table")}
                className={`px-6 py-3 font-sans font-black uppercase text-xs flex items-center gap-2 border-r-2 border-black transition-all cursor-pointer ${
                  activeView === "table" 
                    ? "bg-[#ABF600] text-black" 
                    : "bg-transparent text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Mode Tabel Grid ({csvData.rows.length})
              </button>
              <button
                id="csv-tab-raw"
                onClick={() => setActiveView("raw")}
                className={`px-6 py-3 font-sans font-black uppercase text-xs flex items-center gap-2 border-r-2 border-black transition-all cursor-pointer ${
                  activeView === "raw" 
                    ? "bg-[#ABF600] text-black" 
                    : "bg-transparent text-neutral-500 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <Code className="w-4 h-4" />
                Format Raw CSV String
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-auto p-6" id="csv-modal-scrollable-body">
              
              {activeView === "table" ? (
                <div className="space-y-4">
                  
                  {/* Warning Info */}
                  <div className="flex items-start gap-2.5 p-3.5 bg-[#ABF600]/10 border-2 border-black text-xs text-neutral-700" id="csv-table-tip">
                    <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <strong>Silakan Tinjau:</strong> Nilai nominal Rupiah akan diekspor dalam format angka murni (plain number) tanpa simbol mata uang agar memudahkan parsing spreadsheet atau impor ke Excel, Google Sheets, dan aplikasi akunting eksternal.
                    </div>
                  </div>

                  {/* Render Table */}
                  <div className="border-2 border-black overflow-hidden shadow-[3px_3px_0px_#000000]">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <thead>
                        <tr className="bg-neutral-100 border-b-2 border-black font-extrabold text-neutral-600">
                          {csvData.headers.map((h, i) => (
                            <th key={i} className="p-3 border-r border-black/20 uppercase last:border-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {csvData.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-neutral-50">
                            <td className="p-3 border-r border-black/20 whitespace-nowrap text-neutral-400 font-normal">{row[0]}</td>
                            <td className="p-3 border-r border-black/20 whitespace-nowrap font-bold text-black">{row[1]}</td>
                            <td className="p-3 border-r border-black/20 font-bold font-sans text-neutral-800">{row[2]}</td>
                            <td className="p-3 border-r border-black/20 whitespace-nowrap">
                              <span className="bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 font-bold text-neutral-600 text-[10px]">
                                {row[3]}
                              </span>
                            </td>
                            <td className="p-3 border-r border-black/20 whitespace-nowrap">
                              <span className={`inline-block border border-black px-1.5 py-0.2 font-bold text-[9px] uppercase ${
                                row[4] === "INFLOW" ? "bg-[#ABF600] text-black" : "bg-red-100 text-red-800"
                              }`}>
                                {row[4]}
                              </span>
                            </td>
                            <td className="p-3 text-right font-black whitespace-nowrap text-xs text-black">
                              {formatRupiah(row[5])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-xs font-mono text-neutral-400 uppercase">ISI FILE CSV ASLI (RFC-4180):</span>
                    <button
                      id="copy-raw-csv-btn"
                      onClick={handleCopyRaw}
                      className="text-xs font-mono font-bold bg-neutral-200 hover:bg-neutral-300 border border-black px-3 py-1 shadow-[1px_1px_0px_#000000] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        "Copy to Clipboard"
                      )}
                    </button>
                  </div>

                  <pre className="p-4 bg-neutral-900 text-neutral-200 font-mono text-xs overflow-auto border-2 border-black shadow-[4px_4px_0px_#000000] leading-relaxed select-text max-h-[350px]">
                    {rawCSVString}
                  </pre>
                </div>
              )}

            </div>

            {/* Action Buttons Footer */}
            <div className="bg-neutral-100 border-t-4 border-black px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="csv-modal-actions-footer">
              <span className="text-xs font-sans text-neutral-500 italic max-w-sm">
                Data disimpan murni secara offline di browser Anda. Tidak ada server eksternal yang melacak atau mencatat keuangan Anda.
              </span>
              <div className="flex items-center gap-3 shrink-0 self-end">
                <button
                  id="csv-btn-cancel"
                  onClick={onClose}
                  className="bg-white text-black border-2 border-black px-5 py-2.5 font-extrabold uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="csv-btn-download-confirm"
                  onClick={() => {
                    onConfirmDownload();
                    onClose();
                  }}
                  className="bg-[#ABF600] text-black border-2 border-black px-6 py-2.5 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:translate-x-[3px] active:translate-y-[3px] flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Konfirmasi &amp; Download File
                </button>
              </div>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
