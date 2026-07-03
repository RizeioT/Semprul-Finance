import React, { useState } from "react";
import { User, Lock, ArrowRight, CheckCircle, Info, ShieldCheck, HelpCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserAccount } from "../types";

interface LoginViewProps {
  currentUser: UserAccount | null;
  users: UserAccount[];
  handleLogin: (username: string, passwordPlain: string) => Promise<boolean>;
  handleRegister: (username: string, fullName: string, passwordPlain: string, avatar: string) => Promise<boolean>;
  handleLogout: () => void;
  handleDeleteSavedUser: (username: string) => void;
  triggerAlert: (title: string, message: string) => void;

  // Supabase states
  supabaseStatus: { connected: boolean; tablesExist: boolean; error?: string; bootstrapSQL?: string } | null;
  syncing: boolean;
  lastSynced: string | null;
  handleManualSync: () => Promise<void>;
  syncError: string | null;
}

const AVATAR_OPTIONS = ["👤", "🦊", "🐱", "🦁", "🐼", "🐨", "🐸", "🐙", "🐵", "🦄", "🦅", "⚡"];

export default function LoginView({
  currentUser,
  users,
  handleLogin,
  handleRegister,
  handleLogout,
  handleDeleteSavedUser,
  triggerAlert,
  supabaseStatus,
  syncing,
  lastSynced,
  handleManualSync,
  syncError
}: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAvatar, setRegAvatar] = useState("🦊");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      triggerAlert("KOLOM KOSONG", "Silakan isi username dan kata sandi Anda!");
      return;
    }
    const success = await handleLogin(loginUsername.trim(), loginPassword);
    if (success) {
      setLoginUsername("");
      setLoginPassword("");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleRegister(regUsername, regFullName, regPassword, regAvatar);
    if (success) {
      setRegUsername("");
      setRegFullName("");
      setRegPassword("");
      setRegAvatar("🦊");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="login-dashboard-container">
      
      {/* Upper header section */}
      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_#000000] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-block bg-[#ABF600] text-black text-xs font-bold font-mono px-2.5 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_#000000]">
            {supabaseStatus?.connected && supabaseStatus?.tablesExist 
              ? "⚡ Pusat Autentikasi Supabase Cloud" 
              : "Pusat Autentikasi Offline"}
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            {currentUser ? "Dasbor Akun Pengguna" : "Keamanan Sesi Keuangan"}
          </h2>
          <p className="text-neutral-500 font-mono text-xs uppercase font-bold tracking-wider">
            {supabaseStatus?.connected && supabaseStatus?.tablesExist
              ? "Cloud Synced Engine Enabled (Private Database)"
              : "Multi-User LocalStorage Isolation Engine"}
          </p>
        </div>
        
        {currentUser && (
          <div className="flex items-center gap-4 bg-[#ABF600]/10 border-2 border-black px-4 py-3 shadow-[3px_3px_0px_#000000]" id="current-session-pill">
            <span className="text-3xl p-1.5 bg-white border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
              {currentUser.avatar}
            </span>
            <div>
              <div className="font-extrabold text-sm uppercase text-neutral-800">{currentUser.fullName}</div>
              <div className="text-neutral-500 font-mono text-[10px] uppercase font-bold">Logged as @{currentUser.username}</div>
            </div>
          </div>
        )}
      </div>

      {/* Supabase Status & Table Setup Panel */}
      {supabaseStatus && supabaseStatus.connected && !supabaseStatus.tablesExist && (
        <div className="bg-amber-50 border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-4" id="supabase-setup-alert-panel">
          <div className="flex items-center gap-3 border-b-2 border-black pb-3">
            <HelpCircle className="w-6 h-6 text-amber-600 animate-bounce shrink-0" />
            <div>
              <span className="inline-block bg-amber-200 border border-black px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] mb-0.5">
                DATABASE SETUP
              </span>
              <h3 className="font-extrabold text-base uppercase">Setup Tabel Basis Data Supabase Diperlukan</h3>
            </div>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Koneksi server ke personal Supabase Anda berhasil terhubung! Namun, tabel-tabel data (<code className="bg-amber-100 border border-amber-300 px-1 font-bold text-[11px]">semprul_users</code>, dll) belum terbuat di proyek Supabase Anda.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-bold font-mono text-neutral-800">
              Silakan salin kode SQL di bawah ini, buka tab <strong className="text-black">SQL Editor</strong> di dashboard Supabase Anda, tempel kodenya, dan jalankan (Run):
            </p>
            <div className="relative">
              <pre className="bg-neutral-900 text-[#ABF600] border-2 border-black p-4 font-mono text-[10px] overflow-x-auto rounded-sm max-h-48 shadow-[2px_2px_0px_#000000]">
                {supabaseStatus.bootstrapSQL || "SQL script not available."}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(supabaseStatus.bootstrapSQL || "");
                  triggerAlert("SQL DISALIN", "Script SQL inisialisasi basis data berhasil disalin ke clipboard! Tempel & jalankan ini di SQL Editor dashboard Supabase Anda.");
                }}
                className="absolute right-3 bottom-3 bg-[#ABF600] hover:bg-[#8fd100] text-black border-2 border-black px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                Salin Script SQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Row-Level Security (RLS) Active Alert Panel */}
      {syncError && (syncError.toLowerCase().includes("row-level security") || syncError.toLowerCase().includes("policy") || syncError.toLowerCase().includes("security policy")) && (
        <div className="bg-red-50 border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-4" id="supabase-setup-alert-panel">
          <div className="flex items-center gap-3 border-b-2 border-black pb-3">
            <Lock className="w-6 h-6 text-red-600 animate-bounce shrink-0" />
            <div>
              <span className="inline-block bg-red-200 border border-black px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[1.5px_1.5px_0px_#000000] mb-0.5 text-red-800">
                FIX SECURITY POLICY
              </span>
              <h3 className="font-extrabold text-base uppercase text-red-950">Row-Level Security (RLS) Menghambat Sinkronisasi</h3>
            </div>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Meskipun koneksi berhasil dan tabel-tabel terdeteksi, Supabase menolak penyimpanan data baru karena kebijakan <strong className="text-black">Row-Level Security (RLS)</strong> sedang aktif tanpa adanya hak akses yang sesuai bagi koneksi anonim Anda.
          </p>
          <div className="space-y-2">
            <p className="text-xs font-bold font-mono text-neutral-800">
              Silakan salin instruksi SQL di bawah ini, buka tab <strong className="text-black">SQL Editor</strong> di dashboard Supabase Anda, tempelkan kodenya, dan jalankan (Run) untuk menonaktifkan RLS:
            </p>
            <div className="relative">
              <pre className="bg-neutral-900 text-[#ABF600] border-2 border-black p-4 font-mono text-[10px] overflow-x-auto rounded-sm max-h-48 shadow-[2px_2px_0px_#000000]">
{`ALTER TABLE semprul_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_deleted_history DISABLE ROW LEVEL SECURITY;`}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`ALTER TABLE semprul_users DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_transactions DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_budgets DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_deleted_history DISABLE ROW LEVEL SECURITY;`);
                  triggerAlert("SQL DISALIN", "Script SQL untuk menonaktifkan RLS berhasil disalin ke clipboard! Tempel & jalankan ini di SQL Editor dashboard Supabase Anda.");
                }}
                className="absolute right-3 bottom-3 bg-[#ABF600] hover:bg-[#8fd100] text-black border-2 border-black px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                Salin Script Perbaikan
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentUser ? (
          /* LOGGED IN ACCOUNT PANEL */
          <motion.div
            key="logged-in-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Main Stats Profile Card */}
            <div className="md:col-span-2 bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b-2 border-black pb-3">
                  <h3 className="font-extrabold text-lg uppercase">Informasi Sesi Aktif</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border-2 border-black p-4 bg-neutral-50 font-mono text-xs space-y-1">
                    <span className="text-neutral-400 font-bold uppercase text-[9px]">Nama Lengkap Sesi</span>
                    <p className="font-sans font-black text-base text-neutral-800">{currentUser.fullName}</p>
                  </div>
                  <div className="border-2 border-black p-4 bg-neutral-50 font-mono text-xs space-y-1">
                    <span className="text-neutral-400 font-bold uppercase text-[9px]">ID Username Unik</span>
                    <p className="font-bold text-sm text-neutral-800">@{currentUser.username}</p>
                  </div>
                  <div className="border-2 border-black p-4 bg-neutral-50 font-mono text-xs space-y-1">
                    <span className="text-neutral-400 font-bold uppercase text-[9px]">Status Enkripsi Lokal</span>
                    <div className="flex items-center gap-1.5 text-green-600 font-bold mt-1">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>AKTIF & TERISOLASI</span>
                    </div>
                  </div>
                  <div className="border-2 border-black p-4 bg-neutral-50 font-mono text-xs space-y-1">
                    <span className="text-neutral-400 font-bold uppercase text-[9px]">Terdaftar Sejak</span>
                    <p className="font-bold text-xs mt-1 text-neutral-600">
                      {new Date(currentUser.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-[#ABF600]/10 border-2 border-black p-4 text-xs flex gap-2.5">
                  <Info className="w-5 h-5 text-black shrink-0" />
                  <p className="leading-relaxed">
                    Sesi Anda aktif dan semua data keuangan (Ledger, Budget, dan Keranjang Sampah) diisolasi dengan aman di browser menggunakan kunci database <code className="bg-black text-[#ABF600] px-1 font-mono text-[10px] font-bold">"semprul_user_{currentUser.username}_*"</code>. Data Anda tidak dikirim ke server mana pun di internet untuk privasi penuh!
                  </p>
                </div>
              </div>

              <div className="border-t-2 border-black pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white border-2 border-black font-extrabold uppercase text-xs tracking-wider px-6 py-2.5 shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                  id="logout-action-btn"
                >
                  Keluar dari Sesi ini
                </button>
              </div>
            </div>

            {/* Quick stats on account isolation */}
            <div className="bg-black text-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-neutral-700 pb-3 flex items-center justify-between">
                  <h4 className="font-extrabold uppercase text-[#ABF600] text-sm">
                    {supabaseStatus?.connected && supabaseStatus?.tablesExist ? "Status Supabase Cloud" : "Status Penyimpanan"}
                  </h4>
                  <span className={`${
                    syncError 
                      ? "bg-red-500" 
                      : (supabaseStatus?.connected && supabaseStatus?.tablesExist ? "bg-[#ABF600]" : "bg-green-500")
                  } w-2.5 h-2.5 rounded-full animate-pulse border border-black`} />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">Tipe Database:</span>
                    <span className="font-bold text-white">
                      {supabaseStatus?.connected && supabaseStatus?.tablesExist ? "Supabase Cloud Sync" : "Browser LocalStorage"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">Koneksi Sesi:</span>
                    <span className={`font-bold ${supabaseStatus?.connected && supabaseStatus?.tablesExist ? "text-[#ABF600]" : "text-green-400"}`}>
                      {supabaseStatus?.connected && supabaseStatus?.tablesExist ? "Cloud Protected (SSL)" : "100% Offline"}
                    </span>
                  </div>
                  {supabaseStatus?.connected && supabaseStatus?.tablesExist ? (
                    <>
                      <div className="flex justify-between border-b border-neutral-800 pb-2">
                        <span className="text-neutral-400">Sinkronisasi:</span>
                        <span className={`font-bold ${syncError ? "text-red-400" : "text-green-400"}`}>
                          {syncing ? "⏳ Syncing..." : (syncError ? "⚠️ Gagal" : "🟢 Terhubung")}
                        </span>
                      </div>
                      {lastSynced && (
                        <div className="flex justify-between border-b border-neutral-800 pb-2">
                          <span className="text-neutral-400">Terakhir Sync:</span>
                          <span className="font-bold text-white">{lastSynced}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Total Akun Lokal:</span>
                      <span className="font-bold text-white">{users.length} Akun</span>
                    </div>
                  )}
                </div>

                {/* Show RLS Sync Error Instruction Block in Right Panel */}
                {syncError ? (
                  <div className="p-3 border border-red-900 bg-red-950/50 rounded-sm font-mono text-[10px] leading-relaxed text-red-300 space-y-2">
                    <span className="font-bold text-red-400 uppercase block">⚠️ ERROR ROW-LEVEL SECURITY (RLS):</span>
                    <p>
                      Supabase memblokir penyimpanan data karena RLS aktif. Jalankan perintah SQL berikut di dashboard Supabase Anda:
                    </p>
                    <pre className="bg-black border border-neutral-800 p-2 font-mono text-[9px] text-[#ABF600] overflow-x-auto max-h-32">
{`ALTER TABLE semprul_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_deleted_history DISABLE ROW LEVEL SECURITY;`}
                    </pre>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`ALTER TABLE semprul_users DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_transactions DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_budgets DISABLE ROW LEVEL SECURITY;\nALTER TABLE semprul_deleted_history DISABLE ROW LEVEL SECURITY;`);
                        triggerAlert("SQL DISALIN", "Perintah SQL penonaktifan RLS berhasil disalin ke clipboard! Jalankan ini di SQL Editor dashboard Supabase Anda.");
                      }}
                      className="w-full bg-[#ABF600] hover:bg-[#8fd100] text-black border border-black py-1 font-mono text-[9px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Salin SQL Perbaikan
                    </button>
                  </div>
                ) : (
                  <div className="p-3 border border-neutral-800 bg-neutral-900 rounded-sm font-mono text-[10px] leading-relaxed text-neutral-400">
                    <span className="font-bold text-white uppercase block mb-1">💡 Tips Keamanan:</span>
                    {supabaseStatus?.connected && supabaseStatus?.tablesExist 
                      ? "Data keuangan Anda disinkronkan otomatis setiap kali ada perubahan. Anda juga dapat memaksa sinkronisasi manual kapan saja menggunakan tombol SYNC NOW di header."
                      : "Jangan membersihkan data penjelajahan (Clear Site Data / Cache) di browser Anda untuk menghindari hilangnya riwayat keuangan offline yang disimpan."
                    }
                  </div>
                )}
              </div>

              <div className="bg-white/10 p-3 border border-neutral-700 text-[10px] font-mono text-center text-neutral-300">
                {supabaseStatus?.connected && supabaseStatus?.tablesExist 
                  ? "SempruL Cloud Sync Engine v2.1" 
                  : "SempruL Finance Offline Engine v2.1"
                }
              </div>
            </div>
          </motion.div>
        ) : (
          /* AUTHENTICATION FORM PANEL (LOGIN / REGISTER) */
          <motion.div
            key="auth-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Left/Middle Column - Authentication Cards */}
            <div className="md:col-span-7 bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_#000000] space-y-6">
              
              {/* Tab toggles */}
              <div className="flex border-4 border-black bg-black p-1 select-none">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                    !isRegistering 
                      ? "bg-[#ABF600] text-black" 
                      : "text-white hover:text-neutral-300"
                  }`}
                  id="tab-toggle-login"
                >
                  Masuk Sesi
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className={`flex-1 py-2 font-black uppercase text-xs tracking-wider transition-all cursor-pointer ${
                    isRegistering 
                      ? "bg-[#ABF600] text-black" 
                      : "text-white hover:text-neutral-300"
                  }`}
                  id="tab-toggle-register"
                >
                  Daftar Akun
                </button>
              </div>

              <AnimatePresence mode="wait">
                {!isRegistering ? (
                  /* LOGIN FORM */
                  <motion.form
                    key="login-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Username Akun
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="Masukkan username..."
                          className="w-full bg-neutral-50 border-2 border-black p-2.5 pl-10 font-bold text-sm focus:bg-white focus:outline-none"
                          id="login-username-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Kata Sandi Sesi
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan password..."
                          className="w-full bg-neutral-50 border-2 border-black p-2.5 pl-10 font-mono font-bold text-sm focus:bg-white focus:outline-none"
                          id="login-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-[10px] uppercase font-mono font-bold border border-black bg-white px-1.5 py-0.5 hover:bg-neutral-100 cursor-pointer shadow-[1px_1px_0px_#000000]"
                        >
                          {showLoginPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#ABF600] text-black border-2 border-black py-3 font-extrabold uppercase text-xs tracking-wider shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer flex items-center justify-center gap-1"
                      id="login-submit-btn"
                    >
                      <span>Masuk Sesi Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                ) : (
                  /* REGISTRATION FORM */
                  <motion.form
                    key="register-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Nama Lengkap Anda
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold text-sm focus:bg-white focus:outline-none"
                        id="register-fullname-input"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Username Unik
                      </label>
                      <input
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                        placeholder="Contoh: budis01 (tanpa spasi)"
                        className="w-full bg-neutral-50 border-2 border-black p-2.5 font-bold text-sm focus:bg-white focus:outline-none"
                        id="register-username-input"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Kata Sandi Baru (Offline)
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Buat sandi baru..."
                          className="w-full bg-neutral-50 border-2 border-black p-2.5 pr-14 font-mono font-bold text-sm focus:bg-white focus:outline-none"
                          id="register-password-input"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-2.5 text-[10px] uppercase font-mono font-bold border border-black bg-white px-1.5 py-0.5 hover:bg-neutral-100 cursor-pointer shadow-[1px_1px_0px_#000000]"
                        >
                          {showRegPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Fun Avatar Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black uppercase tracking-wide text-neutral-700">
                        Pilih Avatar Emoji Anda: <span className="font-extrabold text-neutral-900 bg-[#ABF600] px-1 border border-black ml-1 text-sm">{regAvatar}</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 border-2 border-black">
                        {AVATAR_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setRegAvatar(emoji)}
                            className={`text-xl p-2.5 border-2 hover:bg-[#ABF600] transition-colors flex items-center justify-center cursor-pointer ${
                              regAvatar === emoji 
                                ? "bg-[#ABF600] border-black scale-110 shadow-[1px_1px_0px_#000000]" 
                                : "bg-white border-neutral-300 shadow-[1px_1px_0px_#e5e5e5]"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#ABF600] text-black border-2 border-black py-3 font-extrabold uppercase text-xs tracking-wider shadow-[3px_3px_0px_#000000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-y-[2px] cursor-pointer flex items-center justify-center gap-1"
                      id="register-submit-btn"
                    >
                      <span>Buat Akun & Mulai</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Registered Account Directory & Info */}
            <div className="md:col-span-5 space-y-8 flex flex-col justify-between">
              
              {/* Directory of accounts on this machine */}
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-4">
                <div className="border-b-2 border-black pb-2.5">
                  <h3 className="font-extrabold text-sm uppercase text-neutral-800">
                    Sesi Tersimpan di Browser Ini ({users.length})
                  </h3>
                </div>

                {users.length > 0 ? (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {users.map(u => (
                      <div
                        key={u.username}
                        className="group flex items-center justify-between border-2 border-black p-3 hover:bg-[#ABF600]/10 transition-all shadow-[2px_2px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#000000]"
                        id={`local-account-tile-${u.username}`}
                      >
                        <div 
                          className="flex items-center gap-3 cursor-pointer flex-1"
                          onClick={() => {
                            setLoginUsername(u.username);
                            setIsRegistering(false);
                          }}
                          title="Klik untuk memilih akun ini"
                        >
                          <span className="text-2xl p-1 bg-white border border-black font-normal rounded-sm">
                            {u.avatar}
                          </span>
                          <div>
                            <div className="font-extrabold text-xs text-neutral-800 group-hover:text-black">
                              {u.fullName}
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono font-bold">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLoginUsername(u.username);
                              setIsRegistering(false);
                            }}
                            className="text-[10px] font-mono font-black uppercase text-neutral-600 hover:text-black border border-black bg-neutral-100 hover:bg-[#ABF600] px-2 py-1 transition-colors cursor-pointer"
                          >
                            PILIH
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedUser(u.username);
                            }}
                            className="p-1 border border-black bg-red-100 hover:bg-red-500 text-red-700 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                            title="Hapus akun dari browser ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-neutral-300 italic font-bold text-center text-neutral-400 text-xs">
                    Belum ada akun terdaftar di browser ini. Buat akun baru sekarang!
                  </div>
                )}
              </div>

              {/* Informative Security Pitch Card */}
              <div className="bg-black text-white border-4 border-black p-6 shadow-[6px_6px_0px_#000000] space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#ABF600]" />
                  <span className="font-extrabold text-[#ABF600] uppercase text-xs">Offline Isolation System</span>
                </div>
                <p className="leading-relaxed text-neutral-400 text-[11px] font-mono">
                  SempruL Finance menggunakan <strong className="text-white">Isolasi Kunci Sesi Lokal</strong>. Berbeda dengan aplikasi web lainnya yang mengirimkan data Anda ke server awan (cloud), di sini semua transaksi dan rencana anggaran Anda disimpan strictly di dalam database internal peramban Anda.
                </p>
                <div className="text-[10px] text-neutral-500 border-t border-neutral-900 pt-2 font-mono flex items-center justify-between">
                  <span>Connection: Offline Secure</span>
                  <span>SSL: Client-Local</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
