export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  isRecurring?: boolean;
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface Budget {
  category: string;
  allocated: number;
  spent: number;
  icon: string;
}

export interface DeletedTransaction extends Transaction {
  deletedAt: string;
}

export interface UserAccount {
  username: string;
  fullName: string;
  passwordHash: string; // stored encoded
  avatar: string; // emoji or custom string symbol
  createdAt: string;
}


