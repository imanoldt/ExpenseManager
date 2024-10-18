import React, { useState } from 'react';

interface SplitExpense {
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
}

const ExpenseSplitter: React.FC = () => {
  const [expenses, setExpenses] = useState<SplitExpense[]>([]);
  const [newExpense, setNewExpense] = useState<SplitExpense>({
    description: '',
    amount: 0,
    paidBy: '',
    splitBetween: [],
  });
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const addParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant]);
      setNewParticipant('');
    }
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount > 0 && newExpense.paidBy && newExpense.splitBetween.length > 0) {
      setExpenses([...expenses, newExpense]);
      setNewExpense({
        description: '',
        amount: 0,
        paidBy: '',
        splitBetween: [],
      });
    }
  };

  const calculateBalances = () => {
    const balances: { [key: string]: number } = {};
    participants.forEach(p => balances[p] = 0);

    expenses.forEach(expense => {
      const payer = expense.paidBy;
      const splitAmount = expense.amount / expense.splitBetween.length;

      balances[payer] += expense.amount;
      expense.splitBetween.forEach(person => {
        balances[person] -= splitAmount;
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Expense Splitter</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Participants</h3>
        <div className="flex mb-2">
          <input
            type="text"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mr-2"
            placeholder="Add participant"
          />
          <button onClick={addParticipant} className="bg-blue-500 text-white py-2 px-4 rounded">Add</button>
        </div>
        <div className="flex flex-wrap">
          {participants.map((p, index) => (
            <span key={index} className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mr-2 mb-2">{p}</span>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Add Expense</h3>
        <input
          type="text"
          value={newExpense.description}
          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-2"
          placeholder="Description"
        />
        <input
          type="number"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-2"
          placeholder="Amount"
        />
        <select
          value={newExpense.paidBy}
          onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 mb-2"
        >
          <option value="">Paid by</option>
          {participants.map((p, index) => (
            <option key={index} value={p}>{p}</option>
          ))}
        </select>
        <div className="mb-2">
          <p className="mb-1">Split between:</p>
          {participants.map((p, index) => (
            <label key={index} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={newExpense.splitBetween.includes(p)}
                onChange={(e) => {
                  const updatedSplit = e.target.checked
                    ? [...newExpense.splitBetween, p]
                    : newExpense.splitBetween.filter(person => person !== p);
                  setNewExpense({ ...newExpense, splitBetween: updatedSplit });
                }}
                className="mr-2"
              />
              {p}
            </label>
          ))}
        </div>
        <button onClick={addExpense} className="bg-blue-500 text-white py-2 px-4 rounded">Add Expense</button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Balances</h3>
        {Object.entries(balances).map(([person, balance]) => (
          <p key={person}>
            {person}: €{balance.toFixed(2)} {balance > 0 ? '(to receive)' : '(to pay)'}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ExpenseSplitter;