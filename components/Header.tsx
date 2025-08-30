
import React from 'react';
import { PiggyBank } from './icons/PiggyBank';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center gap-3">
        <PiggyBank className="w-10 h-10 text-indigo-600" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Roommate Budget Splitter
        </h1>
      </div>
    </header>
  );
};

export default Header;
