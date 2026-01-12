import React, { useState } from "react";

const LTVCalculator = () => {
  const [totalDebt, setTotalDebt] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [ltv, setLtv] = useState(null);

  const calculateLTV = () => {
    const debt = parseFloat(totalDebt) || 0;
    const value = parseFloat(propertyValue) || 1; // prevent division by zero
    setLtv(debt / value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 LTV Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Loan-to-Value Ratio (LTV)</strong> 
            is a risk indicator showing the proportion of debt to property value. Higher LTV means more leverage.

          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            LTV Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">LTV</span> = 
            <span className="ml-2">Total Debt</span> ÷ 
            <span className="ml-2">Total Property Value</span>
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
                Total Debt
              </label>
              <input
                type="number"
                value={totalDebt}
                onChange={(e) => setTotalDebt(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 180"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Total Property Value
              </label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 450"
              />
            </div>

            <button
              onClick={calculateLTV}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate LTV
            </button>

            {ltv !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                LTV = {(ltv * 100).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LTVCalculator;
