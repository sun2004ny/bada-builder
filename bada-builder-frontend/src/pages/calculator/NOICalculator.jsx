import React, { useState } from "react";

const NOICalculator = () => {
  const [rentalIncome, setRentalIncome] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [operatingExpenses, setOperatingExpenses] = useState("");
  const [noi, setNoi] = useState(null);

  const calculateNOI = () => {
    const rent = parseFloat(rentalIncome) || 0;
    const other = parseFloat(otherIncome) || 0;
    const expenses = parseFloat(operatingExpenses) || 0;
    setNoi(rent + other - expenses);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 NOI Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Net Operating Income (NOI){" "}</strong>
            is used to determine property-level profitability by calculating the income generated from property operations after operating expenses.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            NOI Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">NOI</span> ={" "}
            <span className="ml-2">Rental Income</span> +{" "}
            <span className="ml-2">Other Income</span> –{" "}
            <span className="ml-2">Operating Expenses</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (₹ in crore)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Rental Income
              </label>
              <input
                type="number"
                value={rentalIncome}
                onChange={(e) => setRentalIncome(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 15"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Other Income
              </label>
              <input
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Operating Expenses
              </label>
              <input
                type="number"
                value={operatingExpenses}
                onChange={(e) => setOperatingExpenses(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>

            <button
              onClick={calculateNOI}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate NOI
            </button>

            {noi !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                NOI = ₹{noi.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NOICalculator;
