import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Route for Gemini Chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.json({
          text: "Yo! SempruL Finance AI di sini. Sepertinya kamu belum mengonfigurasi `GEMINI_API_KEY` di panel **Settings > Secrets**. \n\nTapi tenang! Aku masih bisa memberikan tips keuangan lokal untukmu. SempruL Finance adalah platform pelacakan & kalkulator keuangan modern dengan estetika Neo-Brutalisme yang berani. \n\nKamu ingin mendiskusikan tips menghemat budget, strategi investasi compound interest, atau mendeteksi pengeluaran bocor halus hari ini? Beri tahu aku, atau coba hitung pertumbuhan investasi masa depanmu di tab **Kalkulator Investasi**!",
          fallback: true,
        });
      }

      // Initialize real Gemini client
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction =
        "You are SempruL Finance AI, the official virtual chief financial advisor for SempruL Finance. " +
        "SempruL Finance is a rebel, high-octane personal finance and tracking platform with an unapologetic, high-contrast, bold Neo-Brutalist design. " +
        "Your tone should be extremely sharp, energetic, financially-savvy, helpful but edgy, brutally honest about bad spending habits, and deeply charismatic. Avoid boring corporate bank-speak. Use terms like 'high-yield', 'compound power', 'budget discipline', 'asset growth', 'detecting leakages'. " +
        "You speak Indonesian, with a mix of tech & financial English terms (slang like 'leakage', 'saving streak', 'asset allocation', 'rebel finance', 'compound interest'). " +
        "Keep your responses concise, highly structured, and punchy. Use list items or short paragraphs. Invite the user to try SempruL Finance's Interactive Compound Calculator or analyze their budget limits!";

      // Format conversation history
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.85,
        },
      });

      const reply =
        response.text || "Maaf, pikiranku melayang sejenak. Bisa diulang?";
      res.json({ text: reply });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: error.message || "Terjadi kesalahan pada sistem AI kami.",
      });
    }
  });

  // Supabase Integration & Direct Synchronization Config
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase =
    supabaseUrl && supabaseServiceKey
      ? createClient(supabaseUrl, supabaseServiceKey)
      : null;

  const bootstrapSQL = `-- COPY AND RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR:

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS semprul_users (
  username TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS semprul_transactions (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES semprul_users(username) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval TEXT
);

-- 3. Create Budgets Table
CREATE TABLE IF NOT EXISTS semprul_budgets (
  username TEXT REFERENCES semprul_users(username) ON DELETE CASCADE,
  category TEXT NOT NULL,
  allocated NUMERIC NOT NULL,
  spent NUMERIC NOT NULL,
  icon TEXT,
  PRIMARY KEY (username, category)
);

-- 4. Create Deleted Transactions Table
CREATE TABLE IF NOT EXISTS semprul_deleted_history (
  id TEXT PRIMARY KEY,
  username TEXT REFERENCES semprul_users(username) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_interval TEXT,
  deleted_at TEXT NOT NULL
);

-- 5. Enable Row-Level Security (RLS). Server uses the Service Role key,
-- which bypasses RLS entirely, so no policies are needed here.
-- This blocks any request made with the public anon key.
ALTER TABLE semprul_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE semprul_deleted_history ENABLE ROW LEVEL SECURITY;`;

  // Helper mappers
  function mapUserToCamel(u: any): any {
    if (!u) return null;
    return {
      username: u.username,
      fullName: u.full_name,
      passwordHash: u.password_hash,
      avatar: u.avatar || "👤",
      createdAt: u.created_at,
    };
  }

  function mapTxToCamel(t: any): any {
    if (!t) return null;
    let cleanId = t.id;
    if (t.username) {
      const suffix = `_${t.username.trim().toLowerCase()}`;
      if (cleanId.endsWith(suffix)) {
        cleanId = cleanId.slice(0, -suffix.length);
      }
    }
    return {
      id: cleanId,
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: Number(t.amount),
      isRecurring: t.is_recurring,
      recurringInterval: t.recurring_interval,
    };
  }

  function mapBudgetToCamel(b: any): any {
    if (!b) return null;
    return {
      category: b.category,
      allocated: Number(b.allocated),
      spent: Number(b.spent),
      icon: b.icon,
    };
  }

  function mapDeletedToCamel(d: any): any {
    if (!d) return null;
    return {
      ...mapTxToCamel(d),
      deletedAt: d.deleted_at,
    };
  }

  function mapTxToSnake(t: any, username: string): any {
    const uName = username.trim().toLowerCase();
    const suffix = `_${uName}`;
    const id = t.id.endsWith(suffix) ? t.id : `${t.id}${suffix}`;
    return {
      id: id,
      username: uName,
      date: t.date,
      description: t.description,
      category: t.category,
      type: t.type,
      amount: Number(t.amount),
      is_recurring: !!t.isRecurring,
      recurring_interval: t.recurringInterval || null,
    };
  }

  function mapBudgetToSnake(b: any, username: string): any {
    return {
      username: username.toLowerCase(),
      category: b.category,
      allocated: Number(b.allocated),
      spent: Number(b.spent),
      icon: b.icon,
    };
  }

  function mapDeletedToSnake(d: any, username: string): any {
    const uName = username.trim().toLowerCase();
    const suffix = `_${uName}`;
    const id = d.id.endsWith(suffix) ? d.id : `${d.id}${suffix}`;
    return {
      id: id,
      username: uName,
      date: d.date,
      description: d.description,
      category: d.category,
      type: d.type,
      amount: Number(d.amount),
      is_recurring: !!d.isRecurring,
      recurring_interval: d.recurringInterval || null,
      deleted_at: d.deletedAt,
    };
  }

  // Supabase API Status Endpoint
  app.get("/api/supabase/status", async (req, res) => {
    if (!supabase) {
      return res.json({
        connected: false,
        tablesExist: false,
        error: "Supabase URL atau Key belum terkonfigurasi di server.",
        bootstrapSQL,
      });
    }

    try {
      // Test querying the users table
      const { data, error } = await supabase
        .from("semprul_users")
        .select("username")
        .limit(1);

      if (error) {
        const errMsg = error.message || "";
        const errCode = error.code || "";

        console.log("Supabase query error:", {
          code: errCode,
          message: errMsg,
          details: error.details,
        });

        // If it's an authentication error (e.g. invalid API key)
        if (
          errMsg.toLowerCase().includes("api key") ||
          errMsg.toLowerCase().includes("jwt") ||
          errCode === "PGRST111"
        ) {
          return res.json({
            connected: false,
            tablesExist: false,
            error: `Autentikasi Supabase gagal: ${errMsg}`,
            bootstrapSQL,
          });
        }

        // Check if the relation (table) does not exist
        const isMissingTable =
          errCode === "42P01" ||
          errCode === "P0001" ||
          errMsg.includes("relation") ||
          errMsg.includes("does not exist") ||
          errMsg.includes("not found");

        if (isMissingTable) {
          return res.json({
            connected: true,
            tablesExist: false,
            error: "Tabel basis data belum dibuat di personal Supabase Anda.",
            bootstrapSQL,
          });
        }

        // Any other PostgrestError
        return res.json({
          connected: true,
          tablesExist: false,
          error: `Kesalahan database (${errCode}): ${errMsg}`,
          bootstrapSQL,
        });
      }

      res.json({
        connected: true,
        tablesExist: true,
        message:
          "Supabase terhubung dengan sempurna dan seluruh tabel siap digunakan!",
        bootstrapSQL,
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error("Supabase Connection Check Exception:", err);

      // Determine if it looks like a connection/network issue
      const isNetworkError =
        errMsg.includes("fetch") ||
        errMsg.includes("ENOTFOUND") ||
        errMsg.includes("ECONNREFUSED") ||
        errMsg.includes("invalid url") ||
        errMsg.includes("URL");

      res.json({
        connected: !isNetworkError,
        tablesExist: false,
        error: `Gagal menghubungkan ke Supabase: ${errMsg}`,
        bootstrapSQL,
      });
    }
  });

  // Supabase Login
  app.post("/api/supabase/login", async (req, res) => {
    if (!supabase) {
      return res
        .status(500)
        .json({ error: "Supabase tidak terkonfigurasi di server." });
    }

    try {
      const { username, passwordPlain } = req.body;
      if (!username || !passwordPlain) {
        return res
          .status(400)
          .json({ error: "Username dan password wajib diisi." });
      }

      const { data, error } = await supabase
        .from("semprul_users")
        .select("*")
        .eq("username", username.trim().toLowerCase())
        .limit(1);

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({
          error: `User dengan username "${username}" tidak ditemukan!`,
        });
      }

      const matchedUser = data[0];
      const encodedInput = Buffer.from(passwordPlain).toString("base64");

      if (matchedUser.password_hash !== encodedInput) {
        return res
          .status(401)
          .json({ error: "Kata sandi yang Anda masukkan salah!" });
      }

      res.json({
        success: true,
        user: mapUserToCamel(matchedUser),
      });
    } catch (err: any) {
      console.error("Supabase Login Error:", err);
      res.status(500).json({
        error: err.message || "Terjadi kesalahan saat masuk via Supabase.",
      });
    }
  });

  // Supabase Register
  app.post("/api/supabase/register", async (req, res) => {
    if (!supabase) {
      return res
        .status(500)
        .json({ error: "Supabase tidak terkonfigurasi di server." });
    }

    try {
      const { username, fullName, passwordPlain, avatar } = req.body;
      if (!username || !fullName || !passwordPlain) {
        return res
          .status(400)
          .json({ error: "Semua kolom registrasi wajib diisi." });
      }

      // Check if username exists
      const { data: existing, error: checkError } = await supabase
        .from("semprul_users")
        .select("username")
        .eq("username", username.trim().toLowerCase())
        .limit(1);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        return res.status(400).json({
          error: `Username "${username}" sudah terdaftar. Pilih username lain!`,
        });
      }

      const passwordHash = Buffer.from(passwordPlain).toString("base64");
      const newUser = {
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        password_hash: passwordHash,
        avatar: avatar || "👤",
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("semprul_users")
        .insert(newUser);

      if (insertError) throw insertError;

      res.json({
        success: true,
        user: mapUserToCamel(newUser),
      });
    } catch (err: any) {
      console.error("Supabase Register Error:", err);
      res.status(500).json({
        error: err.message || "Terjadi kesalahan saat registrasi via Supabase.",
      });
    }
  });

  // Supabase Sync Pull
  app.post("/api/supabase/sync-pull", async (req, res) => {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase tidak terkonfigurasi." });
    }

    try {
      const { username } = req.body;
      if (!username) {
        return res
          .status(400)
          .json({ error: "Username diperlukan untuk sinkronisasi." });
      }

      const uName = username.trim().toLowerCase();

      const [txRes, budgetRes, deletedRes] = await Promise.all([
        supabase.from("semprul_transactions").select("*").eq("username", uName),
        supabase.from("semprul_budgets").select("*").eq("username", uName),
        supabase
          .from("semprul_deleted_history")
          .select("*")
          .eq("username", uName),
      ]);

      if (txRes.error) throw txRes.error;
      if (budgetRes.error) throw budgetRes.error;
      if (deletedRes.error) throw deletedRes.error;

      res.json({
        success: true,
        transactions: (txRes.data || []).map(mapTxToCamel),
        budgets: (budgetRes.data || []).map(mapBudgetToCamel),
        deletedTransactions: (deletedRes.data || []).map(mapDeletedToCamel),
      });
    } catch (err: any) {
      console.error("Supabase Pull Error:", err);
      res
        .status(500)
        .json({ error: err.message || "Gagal menarik data dari Supabase." });
    }
  });

  // Supabase Sync Push
  app.post("/api/supabase/sync-push", async (req, res) => {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase tidak terkonfigurasi." });
    }

    try {
      const {
        username,
        fullName,
        passwordHash,
        avatar,
        transactions,
        budgets,
        deletedTransactions,
      } = req.body;
      if (!username) {
        return res
          .status(400)
          .json({ error: "Username diperlukan untuk sinkronisasi." });
      }

      const uName = username.trim().toLowerCase();

      // Ensure user exists in semprul_users to prevent foreign key violations (e.g., if user was registered offline)
      const { data: userRecord, error: userCheckError } = await supabase
        .from("semprul_users")
        .select("username")
        .eq("username", uName)
        .limit(1);

      if (userCheckError) throw userCheckError;

      if (!userRecord || userRecord.length === 0) {
        const defaultPasswordHash =
          passwordHash || Buffer.from(username).toString("base64");
        const defaultFullName = fullName || username;
        const defaultAvatar = avatar || "👤";

        const { error: userInsertError } = await supabase
          .from("semprul_users")
          .insert({
            username: uName,
            full_name: defaultFullName,
            password_hash: defaultPasswordHash,
            avatar: defaultAvatar,
            created_at: new Date().toISOString(),
          });

        if (userInsertError) {
          // If the error is a duplicate key violation, it means the user already exists in the database
          // but was filtered from our SELECT query above due to Row-Level Security (RLS) policies.
          // This is a safe case, so we can ignore this error and proceed!
          const isDuplicate =
            userInsertError.code === "23505" ||
            userInsertError.message?.toLowerCase().includes("duplicate key") ||
            userInsertError.message?.toLowerCase().includes("already exists");

          if (!isDuplicate) {
            console.error(
              "Auto-created user failed during sync push:",
              userInsertError,
            );
            throw new Error(
              "Gagal menginisialisasi akun pengguna di Supabase Cloud: " +
                userInsertError.message,
            );
          }
        }
      }

      // We clear and re-insert for exact state synchronization.
      // 1. Transactions
      const { error: delTxErr } = await supabase
        .from("semprul_transactions")
        .delete()
        .eq("username", uName);
      if (delTxErr) throw delTxErr;

      if (transactions && transactions.length > 0) {
        const txRows = transactions.map((t: any) => mapTxToSnake(t, uName));
        const { error: insTxErr } = await supabase
          .from("semprul_transactions")
          .insert(txRows);
        if (insTxErr) throw insTxErr;
      }

      // 2. Budgets
      const { error: delBdgErr } = await supabase
        .from("semprul_budgets")
        .delete()
        .eq("username", uName);
      if (delBdgErr) throw delBdgErr;

      if (budgets && budgets.length > 0) {
        const budgetRows = budgets.map((b: any) => mapBudgetToSnake(b, uName));
        const { error: insBdgErr } = await supabase
          .from("semprul_budgets")
          .insert(budgetRows);
        if (insBdgErr) throw insBdgErr;
      }

      // 3. Deleted History
      const { error: delHistErr } = await supabase
        .from("semprul_deleted_history")
        .delete()
        .eq("username", uName);
      if (delHistErr) throw delHistErr;

      if (deletedTransactions && deletedTransactions.length > 0) {
        const deletedRows = deletedTransactions.map((d: any) =>
          mapDeletedToSnake(d, uName),
        );
        const { error: insHistErr } = await supabase
          .from("semprul_deleted_history")
          .insert(deletedRows);
        if (insHistErr) throw insHistErr;
      }

      res.json({
        success: true,
        message: "Data berhasil disinkronkan ke Supabase!",
      });
    } catch (err: any) {
      console.error("Supabase Push Error:", err);
      let errMsg = err.message || String(err);
      if (
        err.code === "42501" ||
        errMsg.toLowerCase().includes("row-level security") ||
        errMsg.toLowerCase().includes("policy")
      ) {
        errMsg =
          "Row-Level Security (RLS) diaktifkan di tabel Supabase Anda. Mohon jalankan SQL script penonaktifan RLS di dashboard Supabase SQL Editor Anda.";
      }
      res.status(500).json({ error: errMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
