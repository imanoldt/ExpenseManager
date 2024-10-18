import React, { useState } from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (id: string, updatedExpense: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onEditExpense, onDeleteExpense }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Expense>>({});

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const handleSave = () => {
    if (editingId) {
      onEditExpense(editingId, editForm);
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Expense History</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Date</th>
            <th className="text-left">Category</th>
            <th className="text-left">Amount</th>
            <th className="text-left">Note</th>
            <th className="text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              {editingId === expense.id ? (
                <>
                  <td>
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editForm.amount || ''}
                      onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                      className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editForm.note || ''}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      className="w-full p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td>
                    <button onClick={handleSave} className="text-green-500 mr-2">Save</button>
                    <button onClick={handleCancel} className="text-red-500">Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{expense.date}</td>
                  <td>{expense.category}</td>
                  <td>€{expense.amount.toFixed(2)}</td>
                  <td>{expense.note}</td>
                  <td>
                    <button onClick={() => handleEdit(expense)} className="text-blue-500 mr-2">Edit</button>
                    <button onClick={() => onDeleteExpense(expense.id!)} className="text-red-500">Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;