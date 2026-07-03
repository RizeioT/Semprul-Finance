import React, { useState, useEffect } from "react";
import { Transaction, Budget, DeletedTransaction, UserAccount } from "../types";
import {
  getDefaultTransactions,
  getDefaultBudgets,
  getBlankBudgets,
  calculateMetrics,
  calculateCompoundInterest,
  exportToCSV,
  generateCSVData,
  CSVData,
  FinancialMetrics,
  CompoundResult,
  getNextOccurrenceDate,
  formatRupiah
} from "../models/financialModel";

/**
 * useFinanceController.ts (Controller)
 * Custom React Hook that coordinates all state management, user actions,
 * persistence synchronization, and data queries.
 */
export function useFinanceController() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "budget" | "calculator" | "login">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tablesExist: boolean;
    error?: string;
    bootstrapSQL?: string;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // User Accounts State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem("semprul_current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem("semprul_users");
    return saved ? JSON.parse(saved) : [];
  });

  // Financial States loaded dynamically from LocalStorage (user-scoped or guest)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const user = localStorage.getItem("semprul_current_user");
    const parsedUser = user ? JSON.parse(user) : null;
    const prefix = parsedUser ? `semprul_user_${parsedUser.username}` : "semprul";
    const key = `${prefix}_transactions`;
    
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (parsedUser) {
      // Registered users start with blank transactions
      return [];
    }
    const defaultTx = getDefaultTransactions();
    localStorage.setItem(key, JSON.stringify(defaultTx));
    return defaultTx;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const user = localStorage.getItem("semprul_current_user");
    const parsedUser = user ? JSON.parse(user) : null;
    const prefix = parsedUser ? `semprul_user_${parsedUser.username}` : "semprul";
    const key = `${prefix}_budgets`;

    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
    if (parsedUser) {
      // Registered users start with blank zeroed-out budgets
      return getBlankBudgets();
    }
    const defaultBudgets = getDefaultBudgets();
    localStorage.setItem(key, JSON.stringify(defaultBudgets));
    return defaultBudgets;
  });

  const [deletedTransactions, setDeletedTransactions] = useState<DeletedTransaction[]>(() => {
    const user = localStorage.getItem("semprul_current_user");
    const parsedUser = user ? JSON.parse(user) : null;
    const prefix = parsedUser ? `semprul_user_${parsedUser.username}` : "semprul";
    const key = `${prefix}_deleted_history`;

    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // Form State for Quick Transaction
  const [quickTxDesc, setQuickTxDesc] = useState("");
  const [quickTxAmount, setQuickTxAmount] = useState("");
  const [quickTxCategory, setQuickTxCategory] = useState("Makanan & Kopi");
  const [quickTxType, setQuickTxType] = useState<"income" | "expense">("expense");
  const [quickTxSuccess, setQuickTxSuccess] = useState(false);

  // Form State for Main Add Transaction Screen
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState("");
  const [txCategory, setTxCategory] = useState("Makanan & Kopi");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);
  const [txRecurringInterval, setTxRecurringInterval] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Transaction Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState<"All" | "income" | "expense">("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // Calculator State (Compound Interest)
  const [principal, setPrincipal] = useState(5000000); // Rp 5,000,000
  const [monthlyContribution, setMonthlyContribution] = useState(500000); // Rp 500,000
  const [interestRate, setInterestRate] = useState(10); // 10%
  const [duration, setDuration] = useState(5); // 5 Years

  // CSV Export Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvPreviewData, setCsvPreviewData] = useState<CSVData | null>(null);

  // Custom iframe-safe dialog modal state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "alert" | "confirm";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: ""
  });

  const triggerAlert = (title: string, message: string) => {
    setDialogState({
      isOpen: true,
      type: "alert",
      title,
      message
    });
  };

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogState({
      isOpen: true,
      type: "confirm",
      title,
      message,
      onConfirm
    });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch("/api/supabase/status");
      const data = await response.json();
      setSupabaseStatus(data);
    } catch (err) {
      console.error("Failed to check Supabase status:", err);
      setSupabaseStatus({ connected: false, tablesExist: false, error: "Gagal menghubungi server backend." });
    }
  };

  useEffect(() => {
    checkSupabaseStatus();

    // One-time cleanup to remove "esakucing" if present in saved users list,
    // but without restricting future registration under this name.
    const saved = localStorage.getItem("semprul_users");
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (parsed.some(u => u.username === "esakucing")) {
          const cleaned = parsed.filter(u => u.username !== "esakucing");
          setUsers(cleaned);
          localStorage.setItem("semprul_users", JSON.stringify(cleaned));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const syncPushToSupabase = async (
    user: UserAccount | null,
    txs: Transaction[],
    bdgts: Budget[],
    delTxs: DeletedTransaction[]
  ) => {
    if (!user || !supabaseStatus?.connected || !supabaseStatus?.tablesExist) return;
    
    setSyncing(true);
    try {
      const response = await fetch("/api/supabase/sync-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          fullName: user.fullName,
          passwordHash: user.passwordHash,
          avatar: user.avatar,
          transactions: txs,
          budgets: bdgts,
          deletedTransactions: delTxs
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal menyinkronkan data.");
      }
      setLastSynced(new Date().toLocaleTimeString());
      setSyncError(null);
    } catch (err: any) {
      console.error("Auto Sync Push Error:", err);
      setSyncError(err.message || String(err));
    } finally {
      setSyncing(false);
    }
  };

  // Auto-push to Supabase when state changes (debounced by 1.5 seconds)
  useEffect(() => {
    if (currentUser && supabaseStatus?.connected && supabaseStatus?.tablesExist) {
      const timer = setTimeout(() => {
        syncPushToSupabase(currentUser, transactions, budgets, deletedTransactions);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [transactions, budgets, deletedTransactions, currentUser, supabaseStatus]);

  // Sync data to LocalStorage and update budget spent real-time
  useEffect(() => {
    const prefix = currentUser ? `semprul_user_${currentUser.username}` : "semprul";
    localStorage.setItem(`${prefix}_transactions`, JSON.stringify(transactions));
    
    // Re-calculate spent amount per budget category
    setBudgets(prevBudgets => {
      const updated = prevBudgets.map(b => {
        const totalSpent = transactions
          .filter(tx => tx.category === b.category && tx.type === "expense")
          .reduce((sum, tx) => sum + tx.amount, 0);
        return { ...b, spent: totalSpent };
      });
      localStorage.setItem(`${prefix}_budgets`, JSON.stringify(updated));
      return updated;
    });
  }, [transactions, currentUser]);

  // Sync deleted history to LocalStorage
  useEffect(() => {
    const prefix = currentUser ? `semprul_user_${currentUser.username}` : "semprul";
    localStorage.setItem(`${prefix}_deleted_history`, JSON.stringify(deletedTransactions));
  }, [deletedTransactions, currentUser]);


  // Derived Financial Metrics calculations from Model
  const metrics: FinancialMetrics = calculateMetrics(transactions);

  // Derived Compound Interest calculation from Model
  const compoundResult: CompoundResult = calculateCompoundInterest(
    principal,
    monthlyContribution,
    interestRate,
    duration
  );

  // Derived filtered & sorted transactions
  const filteredTransactions = transactions
    .filter(tx => {
      const matchSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === "All" || tx.category === filterCategory;
      const matchType = filterType === "All" || tx.type === filterType;
      return matchSearch && matchCategory && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  // Action Helpers
  const performAddTransaction = (
    desc: string,
    amountStr: string,
    category: string,
    type: "income" | "expense",
    customDate?: string,
    isRecurring?: boolean,
    recurringInterval?: "daily" | "weekly" | "monthly" | "yearly"
  ): boolean => {
    const parsedAmount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
    if (!desc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Masukkan deskripsi valid dan jumlah nominal positif!");
      return false;
    }

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      date: customDate || new Date().toISOString().split('T')[0],
      description: desc,
      category,
      type,
      amount: parsedAmount,
      isRecurring,
      recurringInterval
    };

    setTransactions(prev => [newTx, ...prev]);
    return true;
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = performAddTransaction(quickTxDesc, quickTxAmount, quickTxCategory, quickTxType);
    if (success) {
      setQuickTxDesc("");
      setQuickTxAmount("");
      setQuickTxSuccess(true);
      setTimeout(() => setQuickTxSuccess(false), 3000);
    }
  };

  const handleMainAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = performAddTransaction(txDesc, txAmount, txCategory, txType, txDate, txIsRecurring, txRecurringInterval);
    if (success) {
      setTxDesc("");
      setTxAmount("");
      setTxIsRecurring(false);
      setTxRecurringInterval("monthly");
      triggerAlert("SUKSES", "Transaksi baru berhasil dicatat di Ledger!");
    }
  };

  const handleUpdateRecurringStatus = (
    id: string,
    isRecurring: boolean,
    interval: "daily" | "weekly" | "monthly" | "yearly" = "monthly"
  ) => {
    setTransactions(prev => prev.map(tx => {
      if (tx.id === id) {
        return { ...tx, isRecurring, recurringInterval: interval };
      }
      return tx;
    }));
  };

  const handlePayUpcoming = (tx: Transaction) => {
    const nextDate = getNextOccurrenceDate(tx.date, tx.recurringInterval || "monthly");
    const newId = "tx-" + Date.now();
    const newTx: Transaction = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      description: tx.description,
      category: tx.category,
      type: tx.type,
      amount: tx.amount
    };

    setTransactions(prev => {
      const withNewPayment = [newTx, ...prev];
      return withNewPayment.map(t => {
        if (t.id === tx.id) {
          return { ...t, date: nextDate };
        }
        return t;
      });
    });

    triggerAlert(
      "SUKSES PEMBAYARAN",
      `Tagihan "${tx.description}" (${formatRupiah(tx.amount)}) telah dibayar & dicatat di Ledger hari ini. Jadwal berikutnya dimajukan ke tanggal ${nextDate}.`
    );
  };

  const handleDeleteTransaction = (id: string) => {
    const txToDelete = transactions.find(tx => tx.id === id);
    if (!txToDelete) return;

    triggerConfirm(
      "HAPUS TRANSAKSI?",
      `Apakah Anda yakin ingin memindahkan transaksi "${txToDelete.description}" ke Keranjang Sampah offline?`,
      () => {
        // Create deleted transaction record
        const deletedRecord: DeletedTransaction = {
          ...txToDelete,
          deletedAt: new Date().toISOString()
        };

        // Update lists
        setTransactions(prev => prev.filter(tx => tx.id !== id));
        setDeletedTransactions(prev => [deletedRecord, ...prev]);
      }
    );
  };

  const handleRestoreTransaction = (id: string) => {
    const txToRestore = deletedTransactions.find(tx => tx.id === id);
    if (!txToRestore) return;

    // Destructure to get raw transaction properties
    const { deletedAt, ...rawTx } = txToRestore;

    setDeletedTransactions(prev => prev.filter(tx => tx.id !== id));
    setTransactions(prev => [rawTx, ...prev]);
    triggerAlert("PROSES PEMULIHAN", `Transaksi "${rawTx.description}" berhasil dipulihkan kembali ke Ledger!`);
  };

  const handlePermanentDeleteTransaction = (id: string) => {
    const txToDestroy = deletedTransactions.find(tx => tx.id === id);
    const desc = txToDestroy ? `"${txToDestroy.description}" ` : "";
    
    triggerConfirm(
      "HAPUS PERMANEN?",
      `Hapus permanen transaksi ${desc}dari penyimpanan offline browser? Tindakan ini tidak dapat dibatalkan.`,
      () => {
        setDeletedTransactions(prev => prev.filter(tx => tx.id !== id));
      }
    );
  };

  const handleClearTrash = () => {
    if (deletedTransactions.length === 0) {
      triggerAlert("KERANJANG KOSONG", "Keranjang sampah sudah kosong!");
      return;
    }
    triggerConfirm(
      "KOSONGKAN SAMPAH?",
      "Apakah Anda yakin ingin mengosongkan seluruh Keranjang Sampah secara permanen? Semua data terhapus akan musnah selamanya.",
      () => {
        setDeletedTransactions([]);
      }
    );
  };


  const handleExportCSV = () => {
    exportToCSV(transactions);
  };

  const handleOpenCSVPreview = () => {
    if (transactions.length === 0) {
      triggerAlert("LEDGER KOSONG", "Ledger transaksi kosong! Tidak ada data untuk diekspor.");
      return;
    }
    const data = generateCSVData(transactions);
    setCsvPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleUpdateBudgetAllocated = (category: string, value: number) => {
    const updated = budgets.map(b => b.category === category ? { ...b, allocated: value } : b);
    setBudgets(updated);
    const prefix = currentUser ? `semprul_user_${currentUser.username}` : "semprul";
    localStorage.setItem(`${prefix}_budgets`, JSON.stringify(updated));
  };

  const handleLogin = async (username: string, passwordPlain: string): Promise<boolean> => {
    if (!username.trim() || !passwordPlain.trim()) {
      triggerAlert("LOGIN GAGAL", "Username dan kata sandi wajib diisi!");
      return false;
    }

    // Prioritize Supabase Authentication if connected and tables are present
    if (supabaseStatus?.connected && supabaseStatus?.tablesExist) {
      setSyncing(true);
      try {
        const response = await fetch("/api/supabase/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, passwordPlain })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          triggerAlert("LOGIN GAGAL", data.error || "Gagal melakukan autentikasi.");
          return false;
        }

        const loggedInUser: UserAccount = data.user;
        setCurrentUser(loggedInUser);
        localStorage.setItem("semprul_current_user", JSON.stringify(loggedInUser));

        // Pull corresponding data from Supabase
        const pullResponse = await fetch("/api/supabase/sync-pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loggedInUser.username })
        });
        const pullData = await pullResponse.json();

        if (pullResponse.ok && pullData.success) {
          const loadedTx = pullData.transactions || [];
          const loadedBudgets = pullData.budgets && pullData.budgets.length > 0 
            ? pullData.budgets 
            : getBlankBudgets();
          const loadedDeleted = pullData.deletedTransactions || [];

          setTransactions(loadedTx);
          setBudgets(loadedBudgets);
          setDeletedTransactions(loadedDeleted);

          // Update local cache fallback too
          const prefix = `semprul_user_${loggedInUser.username}`;
          localStorage.setItem(`${prefix}_transactions`, JSON.stringify(loadedTx));
          localStorage.setItem(`${prefix}_budgets`, JSON.stringify(loadedBudgets));
          localStorage.setItem(`${prefix}_deleted_history`, JSON.stringify(loadedDeleted));
        }

        triggerAlert("LOGIN SUKSES (SUPABASE)", `Selamat datang kembali, ${loggedInUser.fullName}! Sesi keuangan Anda telah dimuat dengan aman dari personal Supabase Anda.`);
        setActiveTab("overview");
        return true;
      } catch (err: any) {
        console.error("Supabase Login Error:", err);
        triggerAlert("LOGIN GAGAL", "Koneksi Supabase bermasalah: " + (err.message || err));
        return false;
      } finally {
        setSyncing(false);
      }
    }

    // Offline LocalStorage Fallback
    const matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!matchedUser) {
      triggerAlert("LOGIN GAGAL", `User dengan username "${username}" tidak ditemukan!`);
      return false;
    }

    // Custom base64 encode check for offline password representation
    const encodedInput = btoa(passwordPlain);
    if (matchedUser.passwordHash !== encodedInput) {
      triggerAlert("LOGIN GAGAL", "Kata sandi yang dimasukkan salah!");
      return false;
    }

    // Success! Update current user state
    setCurrentUser(matchedUser);
    localStorage.setItem("semprul_current_user", JSON.stringify(matchedUser));

    // Load user's data
    const prefix = `semprul_user_${matchedUser.username}`;
    
    const savedTx = localStorage.getItem(`${prefix}_transactions`);
    const loadedTx = savedTx ? JSON.parse(savedTx) : [];
    setTransactions(loadedTx);

    const savedBudgets = localStorage.getItem(`${prefix}_budgets`);
    const loadedBudgets = savedBudgets ? JSON.parse(savedBudgets) : getBlankBudgets();
    setBudgets(loadedBudgets);

    const savedDeleted = localStorage.getItem(`${prefix}_deleted_history`);
    setDeletedTransactions(savedDeleted ? JSON.parse(savedDeleted) : []);

    triggerAlert("LOGIN SUKSES", `Selamat datang kembali, ${matchedUser.fullName}! Sesi keuanganmu telah dimuat.`);
    setActiveTab("overview");
    return true;
  };

  const handleRegister = async (username: string, fullName: string, passwordPlain: string, avatar: string): Promise<boolean> => {
    if (!username.trim() || !fullName.trim() || !passwordPlain.trim()) {
      triggerAlert("REGISTRASI GAGAL", "Semua kolom registrasi wajib diisi!");
      return false;
    }

    // Prioritize Supabase Registration if connected and tables are present
    if (supabaseStatus?.connected && supabaseStatus?.tablesExist) {
      setSyncing(true);
      try {
        const response = await fetch("/api/supabase/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, fullName, passwordPlain, avatar })
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          triggerAlert("REGISTRASI GAGAL", data.error || "Gagal melakukan pendaftaran.");
          return false;
        }

        const newUser: UserAccount = data.user;
        setCurrentUser(newUser);
        localStorage.setItem("semprul_current_user", JSON.stringify(newUser));

        // Setup blank states
        const defTx: any[] = [];
        const defBudgets = getBlankBudgets();

        setTransactions(defTx);
        setBudgets(defBudgets);
        setDeletedTransactions([]);

        const prefix = `semprul_user_${newUser.username}`;
        localStorage.setItem(`${prefix}_transactions`, JSON.stringify(defTx));
        localStorage.setItem(`${prefix}_budgets`, JSON.stringify(defBudgets));
        localStorage.setItem(`${prefix}_deleted_history`, JSON.stringify([]));

        // Pre-seed newly created user database on Supabase with blank state
        await fetch("/api/supabase/sync-push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUser.username,
            transactions: defTx,
            budgets: defBudgets,
            deletedTransactions: []
          })
        });

        triggerAlert("REGISTRASI SUKSES (SUPABASE)", `Akun "${newUser.fullName}" berhasil didaftarkan di personal Supabase Anda! Sesi keuangan baru Anda telah diinisialisasi dalam keadaan kosong.`);
        setActiveTab("overview");
        return true;
      } catch (err: any) {
        console.error("Supabase Register Error:", err);
        triggerAlert("REGISTRASI GAGAL", "Koneksi Supabase bermasalah: " + (err.message || err));
        return false;
      } finally {
        setSyncing(false);
      }
    }

    // Offline LocalStorage Fallback
    const exists = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) {
      triggerAlert("REGISTRASI GAGAL", `Username "${username}" sudah terdaftar. Silakan pilih username lain.`);
      return false;
    }

    const newUser: UserAccount = {
      username: username.trim(),
      fullName: fullName.trim(),
      passwordHash: btoa(passwordPlain),
      avatar: avatar || "👤",
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("semprul_users", JSON.stringify(updatedUsers));

    // Log the user in automatically!
    setCurrentUser(newUser);
    localStorage.setItem("semprul_current_user", JSON.stringify(newUser));

    // Initialize user's storage keys with blank data
    const prefix = `semprul_user_${newUser.username}`;
    const defTx: any[] = [];
    const defBudgets = getBlankBudgets();
    
    localStorage.setItem(`${prefix}_transactions`, JSON.stringify(defTx));
    localStorage.setItem(`${prefix}_budgets`, JSON.stringify(defBudgets));
    localStorage.setItem(`${prefix}_deleted_history`, JSON.stringify([]));

    setTransactions(defTx);
    setBudgets(defBudgets);
    setDeletedTransactions([]);

    triggerAlert("REGISTRASI SUKSES", `Akun "${newUser.fullName}" berhasil dibuat! Sesi keuangan baru Anda telah diinisialisasi dalam keadaan kosong.`);
    setActiveTab("overview");
    return true;
  };

  const handleLogout = () => {
    triggerConfirm(
      "KELUAR SESI",
      "Apakah Anda yakin ingin keluar dari sesi keuangan ini?",
      () => {
        setCurrentUser(null);
        localStorage.removeItem("semprul_current_user");

        // Load Guest/Local data
        const savedTx = localStorage.getItem("semprul_transactions");
        setTransactions(savedTx ? JSON.parse(savedTx) : getDefaultTransactions());

        const savedBudgets = localStorage.getItem("semprul_budgets");
        setBudgets(savedBudgets ? JSON.parse(savedBudgets) : getDefaultBudgets());

        const savedDeleted = localStorage.getItem("semprul_deleted_history");
        setDeletedTransactions(savedDeleted ? JSON.parse(savedDeleted) : []);

        triggerAlert("LOGOUT BERHASIL", "Anda telah keluar dari akun. Ledger Guest/Tamu diaktifkan kembali.");
        setActiveTab("overview");
      }
    );
  };

  const handleDeleteSavedUser = (username: string) => {
    triggerConfirm(
      "HAPUS AKUN TERSEDIA?",
      `Apakah Anda yakin ingin menghapus saved username @${username} dari daftar masuk di browser ini? Tindakan ini hanya menghapus profil masuk lokal, data transaksi lokal Anda di browser tidak akan terhapus.`,
      () => {
        const updatedUsers = users.filter(u => u.username !== username);
        setUsers(updatedUsers);
        localStorage.setItem("semprul_users", JSON.stringify(updatedUsers));
        
        // If the current user is the one being deleted, log them out
        if (currentUser && currentUser.username === username) {
          setCurrentUser(null);
          localStorage.removeItem("semprul_current_user");
          
          // Reset to default/guest state
          const savedTx = localStorage.getItem("semprul_transactions");
          setTransactions(savedTx ? JSON.parse(savedTx) : getDefaultTransactions());

          const savedBudgets = localStorage.getItem("semprul_budgets");
          setBudgets(savedBudgets ? JSON.parse(savedBudgets) : getDefaultBudgets());

          const savedDeleted = localStorage.getItem("semprul_deleted_history");
          setDeletedTransactions(savedDeleted ? JSON.parse(savedDeleted) : []);
        }
        
        triggerAlert("HAPUS SUKSES", `Akun @${username} berhasil dihapus dari daftar browser.`);
      }
    );
  };

  const handleManualSync = async () => {
    if (!currentUser) {
      triggerAlert("SINKRONISASI", "Silakan login terlebih dahulu untuk menyinkronkan data.");
      return;
    }
    if (!supabaseStatus?.connected || !supabaseStatus?.tablesExist) {
      triggerAlert("SINKRONISASI GAGAL", "Koneksi Supabase belum terjalin atau tabel basis data belum dibuat.");
      return;
    }

    setSyncing(true);
    try {
      const response = await fetch("/api/supabase/sync-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          fullName: currentUser.fullName,
          passwordHash: currentUser.passwordHash,
          avatar: currentUser.avatar,
          transactions,
          budgets,
          deletedTransactions
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mendorong data.");
      }
      setLastSynced(new Date().toLocaleTimeString());
      setSyncError(null);
      triggerAlert("SINKRONISASI SUKSES", "Seluruh data Ledger cashflow Anda berhasil diunggah dan disimpan aman di basis data Supabase Anda!");
    } catch (err: any) {
      console.error("Manual Sync Error:", err);
      setSyncError(err.message || String(err));
      triggerAlert("SINKRONISASI GAGAL", err.message || "Gagal menyinkronkan data.");
    } finally {
      setSyncing(false);
    }
  };

  return {
    // Navigation
    activeTab,
    setActiveTab,
    mobileMenuOpen,
    setMobileMenuOpen,

    // Authentication
    currentUser,
    users,
    handleLogin,
    handleRegister,
    handleLogout,
    handleDeleteSavedUser,

    // Ledger States
    transactions,
    budgets,
    metrics,
    filteredTransactions,

    // Forms
    quickTxDesc,
    setQuickTxDesc,
    quickTxAmount,
    setQuickTxAmount,
    quickTxCategory,
    setQuickTxCategory,
    quickTxType,
    setQuickTxType,
    quickTxSuccess,
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

    // Filters
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,

    // Compound Sandbox
    principal,
    setPrincipal,
    monthlyContribution,
    setMonthlyContribution,
    interestRate,
    setInterestRate,
    duration,
    setDuration,
    compoundResult,

    // CSV Export Preview
    isPreviewOpen,
    setIsPreviewOpen,
    csvPreviewData,
    handleOpenCSVPreview,

    // Custom dialog modal system
    dialogState,
    closeDialog,
    triggerAlert,

    // Trash Bin / Deleted History
    deletedTransactions,
    handleRestoreTransaction,
    handlePermanentDeleteTransaction,
    handleClearTrash,

    // Submit Action handlers
    handleQuickAddSubmit,
    handleMainAddSubmit,
    handleDeleteTransaction,
    handleExportCSV,
    handleUpdateBudgetAllocated,
    handleUpdateRecurringStatus,
    handlePayUpcoming,

    // Supabase States & Actions
    supabaseStatus,
    checkSupabaseStatus,
    syncing,
    lastSynced,
    handleManualSync,
    syncError
  };
}
