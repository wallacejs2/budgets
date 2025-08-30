import React from 'react';

interface Summary {
  myTotalPaid: number;
  roommateTotalPaid: number;
  myTotalShare: number;
  roommateTotalShare: number;
  balance: number;
}

interface SummaryCardProps {
  summary: Summary;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const { balance, myTotalPaid, roommateTotalPaid, myTotalShare, roommateTotalShare } = summary;

  const summaryBalanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-800';
  const balanceText =
    balance > 0
      ? `Roommate owes you`
      : balance < 0
      ? `You owe Roommate`
      : `You are all settled up!`;

  const myBalanceColor = balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-800';
  const roommateBalanceColor = balance < 0 ? 'text-green-600' : balance > 0 ? 'text-red-600' : 'text-gray-800';
  
  const roommateBalance = -balance;
  
  const formatBalanceWithSign = (amount: number) => {
    if (amount > 0) return `+$${amount.toFixed(2)}`;
    if (amount < 0) return `-$${Math.abs(amount).toFixed(2)}`;
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      {/* Top Part: Final Balance */}
      <div className="flex flex-col items-center text-center">
        <p className="text-lg text-gray-600">{balanceText}</p>
        <p className={`text-4xl font-bold ${summaryBalanceColor}`}>
          ${Math.abs(balance).toFixed(2)}
        </p>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Bottom Part: Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* My Column */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-gray-800 text-center">You</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Paid:</span>
            <span className="font-semibold text-gray-800 text-lg">${myTotalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Share:</span>
            <span className="font-semibold text-gray-800 text-lg">${myTotalShare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 mt-2">
            <span className="text-sm text-gray-500 font-semibold">Balance:</span>
            <span className={`font-bold text-lg ${myBalanceColor}`}>
              {formatBalanceWithSign(balance)}
            </span>
          </div>
        </div>

        {/* Roommate Column */}
        <div className="space-y-2 pl-4 border-l border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 text-center">Roommate</h3>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Paid:</span>
            <span className="font-semibold text-gray-800 text-lg">${roommateTotalPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">Share:</span>
            <span className="font-semibold text-gray-800 text-lg">${roommateTotalShare.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 mt-2">
            <span className="text-sm text-gray-500 font-semibold">Balance:</span>
            <span className={`font-bold text-lg ${roommateBalanceColor}`}>
              {formatBalanceWithSign(roommateBalance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;