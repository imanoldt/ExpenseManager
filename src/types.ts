export interface Expense {
  id?: string;
  userId: string;
  date: string;
  category: string;
  amount: number;
  note: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: string;
  email: string;
}