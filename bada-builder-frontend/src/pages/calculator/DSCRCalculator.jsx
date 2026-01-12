import React, { useState } from "react";

const DSCRCalculator = () => {
  const [noi, setNoi] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interest, setInterest] = useState("");
  const [dscr, setDscr] = useState(null);

  const calculateDSCR = () => {
    const netOperatingIncome = parseFloat(noi) || 0;
    const totalDebtService = (parseFloat(principal) || 0) + (parseFloat(interest) || 0);

    if (totalDebtService > 0) {
      setDscr(netOperatingIncome / totalDebtService);
    } else {
      setDscr(0); // Or show error if total debt service is 0
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            💼 DSCR Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Debt Service Coverage Ratio (DSCR)</strong> measures a REIT's ability to pay its debt obligations using net operating income.
            A DSCR greater than 1 indicates sufficient income to cover debt.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            DSCR Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">DSCR</span> = 
            <span className="ml-2">Net Operating Income (NOI)</span> ÷ 
            <span className="ml-2">Total Debt Service (Principal + Interest)</span>
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
                Net Operating Income (NOI)
              </label>
              <input
                type="number"
                value={noi}
                onChange={(e) => setNoi(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Principal Payments
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Interest Payments
              </label>
              <input
                type="number"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4"
              />
            </div>

            <button
              onClick={calculateDSCR}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate DSCR
            </button>

            {dscr !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                DSCR = {dscr.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSCRCalculator;
