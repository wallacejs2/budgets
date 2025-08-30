import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense, User, SplitMethod } from './types';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import CategoryChart from './components/CategoryChart';
import { PlusCircle } from './components/icons/PlusCircle';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem('expenses');
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error("Failed to load expenses from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (error) {
      console.error("Failed to save expenses to localStorage:", error);
    }
  }, [expenses]);

  const handleAddExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prevExpenses => [
      { ...expense, id: new Date().toISOString() + Math.random() },
      ...prevExpenses
    ]);
    setIsModalOpen(false);
  }, []);
  
  const handleUpdateExpense = useCallback((updatedExpense: Expense) => {
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setIsModalOpen(false);
    setEditingExpense(null);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingExpense(null);
  }, []);

  const handleDeleteExpense = useCallback((id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  }, []);

  const summary = useMemo(() => {
    let myTotalPaid = 0;
    let roommateTotalPaid = 0;
    let myTotalShare = 0;
    let roommateTotalShare = 0;

    expenses.forEach(expense => {
      const amount = expense.amount;
      if (expense.paidBy === User.Me) {
        myTotalPaid += amount;
      } else {
        roommateTotalPaid += amount;
      }

      switch (expense.splitMethod) {
        case SplitMethod.Equally:
          myTotalShare += amount / 2;
          roommateTotalShare += amount / 2;
          break;
        case SplitMethod.MeOwesFull:
          myTotalShare += amount;
          break;
        case SplitMethod.RoommateOwesFull:
          roommateTotalShare += amount;
          break;
      }
    });
    
    const balance = myTotalPaid - myTotalShare;

    return {
      myTotalPaid,
      roommateTotalPaid,
      myTotalShare,
      roommateTotalShare,
      balance,
    };
  }, [expenses]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SummaryCard summary={summary} />
            <div className="bg-white p-6 rounded-md shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded shadow-sm hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Expense
                    </button>
                </div>
                <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} onEdit={handleEditExpense} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Spending by Category</h2>
            <CategoryChart expenses={expenses} />
          </div>
        </div>
      </main>
      {isModalOpen && (
        <ExpenseForm 
            onAddExpense={handleAddExpense} 
            onUpdateExpense={handleUpdateExpense}
            expenseToEdit={editingExpense}
            onClose={handleCloseModal} 
        />
      )}
    </div>
  );
};

export default App;