import React from 'react';
import { Expense } from '../types';
import { Trash } from './icons/Trash';
import { Pencil } from './icons/Pencil';
import { Groceries, Utilities, Rent, Entertainment, Dining, Transportation, Shopping, Health, Subscriptions, Other } from './icons/CategoryIcons';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
}

const categoryIcons: { [key: string]: React.FC<{className: string}> } = {
  Groceries: Groceries,
  Utilities: Utilities,
  Rent: Rent,
  Subscriptions: Subscriptions,
  Entertainment: Entertainment,
  'Dining Out': Dining,
  Transportation: Transportation,
  Shopping: Shopping,
  Health: Health,
  Other: Other
};


const ExpenseItem: React.FC<{ expense: Expense; onDelete: (id: string) => void; onEdit: (expense: Expense) => void; }> = ({ expense, onDelete, onEdit }) => {
  const Icon = categoryIcons[expense.category] || categoryIcons['Other'];

  return (
    <li className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full">
                <Icon className="w-6 h-6 text-indigo-600"/>
            </div>
            <div>
                <p className="font-semibold text-gray-800">{expense.description}</p>
                <p className="text-sm text-gray-500">
                    Paid by {expense.paidBy} on {new Date(expense.date).toLocaleDateString()}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right">
                <p className="font-bold text-lg text-gray-800">${expense.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{expense.splitMethod}</p>
            </div>
            <div className="flex items-center">
                <button
                    onClick={() => onEdit(expense)}
                    className="text-gray-400 hover:text-indigo-500 transition-colors p-2 rounded-full"
                    aria-label="Edit expense"
                >
                    <Pencil className="w-5 h-5"/>
                </button>
                <button
                    onClick={() => onDelete(expense.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"
                    aria-label="Delete expense"
                >
                    <Trash className="w-5 h-5"/>
                </button>
            </div>
        </div>
    </li>
  )
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No expenses yet.</p>
        <p>Click "Add Expense" to get started!</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </ul>
  );
};

export default ExpenseList;