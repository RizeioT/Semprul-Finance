import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CustomDialogProps {
  isOpen: boolean;
  type: "alert" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export default function CustomDialog({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onClose
}: CustomDialogProps) {
  // Support ESC key to close
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" id="custom-dialog-container">
          
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
            id="custom-dialog-backdrop"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-md border-4 border-black shadow-[6px_6px_0px_#000000] z-10 flex flex-col overflow-hidden"
            id="custom-dialog-modal"
          >
            {/* Header banner */}
            <div className="bg-black text-white px-5 py-3 flex items-center justify-between border-b-4 border-black select-none">
              <div className="flex items-center gap-2">
                {type === "confirm" ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Info className="w-5 h-5 text-[#ABF600]" />
                )}
                <span className="font-sans font-black uppercase tracking-tight text-sm">
                  {title || "Sistem Keuangan Semprul"}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-0.5"
                id="custom-dialog-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main content body */}
            <div className="p-6 space-y-4" id="custom-dialog-body">
              <p className="font-mono text-sm text-neutral-800 leading-relaxed font-bold break-words whitespace-pre-wrap">
                {message}
              </p>
            </div>

            {/* Action buttons footer */}
            <div className="bg-neutral-50 border-t-2 border-black px-5 py-3.5 flex items-center justify-end gap-3">
              {type === "confirm" ? (
                <>
                  <button
                    onClick={onClose}
                    className="bg-white text-black border-2 border-black px-4 py-1.5 font-extrabold uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer"
                    id="custom-dialog-cancel-btn"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (onConfirm) onConfirm();
                      onClose();
                    }}
                    className="bg-red-500 text-white border-2 border-black px-5 py-1.5 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer"
                    id="custom-dialog-confirm-btn"
                  >
                    Setuju
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="bg-[#ABF600] text-black border-2 border-black px-6 py-1.5 font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer"
                  id="custom-dialog-ok-btn"
                >
                  OK
                </button>
              )}
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}
