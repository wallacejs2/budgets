import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Expense, User, SplitMethod } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit: Expense | null;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, onUpdateExpense, expenseToEdit, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState<User>(User.Me);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(SplitMethod.Equally);

  const isEditMode = expenseToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
        setDescription(expenseToEdit.description);
        setAmount(String(expenseToEdit.amount));
        setDate(expenseToEdit.date);
        setCategory(expenseToEdit.category);
        setPaidBy(expenseToEdit.paidBy);
        setSplitMethod(expenseToEdit.splitMethod);
    }
  }, [expenseToEdit, isEditMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
        alert("Please fill out all fields.");
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid, positive amount.");
      return;
    }

    const expenseData = {
        description,
        amount: parsedAmount,
        date,
        category,
        paidBy,
        splitMethod,
      };
  
      if (isEditMode) {
          onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
      } else {
          onAddExpense(expenseData);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <div className="relative">
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Weekly groceries"
                    required
                />
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              required
              step="0.01"
              min="0.01"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">Paid By</label>
             <div className="flex gap-4">
                {(Object.values(User)).map(user => (
                    <button type="button" key={user} onClick={() => setPaidBy(user)} className={`flex-1 py-2 px-4 rounded transition-colors ${paidBy === user ? 'bg-indigo-600 text-white font-semibold shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {user}
                    </button>
                ))}
            </div>
          </div>
          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">Split Method</label>
              <select
                id="splitMethod"
                value={splitMethod}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSplitMethod(e.target.value as SplitMethod)}
                className="block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.values(SplitMethod).map(method => <option key={method} value={method}>{method}</option>)}
              </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-semibold">Cancel</button>
            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold shadow">{isEditMode ? 'Update' : 'Add'} Expense</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;