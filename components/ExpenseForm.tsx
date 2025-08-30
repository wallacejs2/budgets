import React, { useState, useCallback, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { Expense, User, SplitMethod } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { categorizeExpense, parseReceipt } from '../services/geminiService';
import { Camera } from './icons/Camera';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  expenseToEdit: Expense | null;
  onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
);

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, onUpdateExpense, expenseToEdit, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paidBy, setPaidBy] = useState<User>(User.Me);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(SplitMethod.Equally);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDescriptionBlur = useCallback(async () => {
    if (description.trim().length > 3) {
      setIsCategorizing(true);
      try {
        const suggestedCategory = await categorizeExpense(description);
        if (suggestedCategory) {
          setCategory(suggestedCategory);
        }
      } finally {
        setIsCategorizing(false);
      }
    }
  }, [description]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
        alert("Please fill out all fields.");
        return;
    }
    const expenseData = {
        description,
        amount: parseFloat(amount),
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

  const handleScanReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64String = (reader.result as string).split(',')[1];
            const receiptData = await parseReceipt(base64String, file.type);
            
            if (receiptData) {
                if (receiptData.description) setDescription(receiptData.description);
                if (receiptData.amount) setAmount(String(receiptData.amount));
                if (receiptData.date) setDate(receiptData.date);

                if (receiptData.description) {
                     setIsCategorizing(true);
                     try {
                        const suggestedCategory = await categorizeExpense(receiptData.description);
                        if (suggestedCategory) setCategory(suggestedCategory);
                     } finally {
                        setIsCategorizing(false);
                     }
                }
            } else {
              alert('Could not extract details from the receipt. Please enter them manually.');
            }
        };
        reader.onerror = (error) => {
             console.error('Error reading file:', error);
             alert('Failed to read the receipt file.');
        };
    } catch (error) {
        console.error('Error parsing receipt:', error);
        alert('An error occurred while scanning the receipt.');
    } finally {
        setIsScanning(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-md shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-4">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleScanReceipt} 
                  className="hidden" 
                  accept="image/*"
                  disabled={isScanning}
              />
              <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="flex items-center gap-2 py-2 px-4 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 font-semibold disabled:opacity-50 disabled:cursor-wait transition-colors"
              >
                  {isScanning ? (
                      <>
                          <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                          Scanning...
                      </>
                  ) : (
                      <>
                          <Camera className="w-5 h-5"/>
                          Scan Receipt
                      </>
                  )}
              </button>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <div className="relative">
                <input
                    type="text"
                    id="description"
                    value={description}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    className="mt-1 block w-full border border-gray-300 rounded shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Weekly groceries"
                    required
                />
                {isCategorizing && <LoadingSpinner />}
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