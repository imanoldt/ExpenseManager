import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Sun, Moon } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseSplitter from './ExpenseSplitter';
import { Expense, Category } from '../types';
import { auth, firestore } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories] = useState<Category[]>([
    { id: 1, name: 'Supplements' },
    { id: 2, name: 'Shopping' },
    { id: 3, name: 'Dining/Bars' },
    { id: 4, name: 'Bills and Utilities' },
    { id: 5, name: 'Transportation' },
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const user = auth.currentUser;
    const isTestUser = localStorage.getItem('testUser') === 'true';
    if (user || isTestUser) {
      if (isTestUser) {
        // For test user, use mock data
        setExpenses([
          { id: '1', userId: 'testUser', date: '2023-05-01', category: 'Shopping', amount: 50, note: 'Groceries' },
          { id: '2', userId: 'testUser', date: '2023-05-02', category: 'Dining/Bars', amount: 30, note: 'Lunch' },
          { id: '3', userId: 'testUser', date: '2023-05-03', category: 'Transportation', amount: 20, note: 'Bus fare' },
        ]);
      } else {
        const q = query(collection(firestore, 'expenses'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedExpenses: Expense[] = [];
        querySnapshot.forEach((doc) => {
          fetchedExpenses.push({ id: doc.id, ...doc.data() } as Expense);
        });
        setExpenses(fetchedExpenses);
      }
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    const isTestUser = localStorage.getItem('testUser') === 'true';
    if (user || isTestUser) {
      try {
        if (isTestUser) {
          // For test user, add to local state
          setExpenses([...expenses, { id: Date.now().toString(), userId: 'testUser', ...expense }]);
        } else {
          await addDoc(collection(firestore, 'expenses'), {
            ...expense,
            userId: user!.uid,
            amount: parseFloat(expense.amount.toString()),
          });
          fetchExpenses();
        }
        toast.success('Expense added successfully');
      } catch (error) {
        toast.error('Error adding expense');
      }
    }
  };

  const editExpense = async (id: string, updatedExpense: Partial<Expense>) => {
    const isTestUser = localStorage.getItem('testUser') === 'true';
    try {
      if (isTestUser) {
        // For test user, update local state
        setExpenses(expenses.map(exp => exp.id === id ? { ...exp, ...updatedExpense } : exp));
      } else {
        await updateDoc(doc(firestore, 'expenses', id), updatedExpense);
        fetchExpenses();
      }
      toast.success('Expense updated successfully');
    } catch (error) {
      toast.error('Error updating expense');
    }
  };

  const deleteExpense = async (id: string) => {
    const isTestUser = localStorage.getItem('testUser') === 'true';
    try {
      if (isTestUser) {
        // For test user, remove from local state
        setExpenses(expenses.filter(exp => exp.id !== id));
      } else {
        await deleteDoc(doc(firestore, 'expenses', id));
        fetchExpenses();
      }
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Error deleting expense');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem('testUser');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const expensesByCategory = categories.map(category => ({
    category: category.name,
    amount: expenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));

  const chartData = {
    labels: expensesByCategory.map(item => item.category),
    datasets: [
      {
        data: expensesByCategory.map(item => item.amount),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Monthly Expense Manager</h1>
          <div className="flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 mr-4"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Expense Dashboard</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold">€{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Expenses by Category</h3>
              <div className="w-full h-64">
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
          <ExpenseForm onAddExpense={addExpense} categories={categories} />
        </div>
        <ExpenseList expenses={expenses} onEditExpense={editExpense} onDeleteExpense={deleteExpense} />
        <ExpenseSplitter />
      </div>
    </div>
  );
};

export default Dashboard;