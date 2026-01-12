import React, { useState } from "react";

const NAVCalculator = () => {
  const [marketValue, setMarketValue] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [sharesOutstanding, setSharesOutstanding] = useState("");
  const [nav, setNav] = useState(null);

  const calculateNAV = () => {
    const mv = parseFloat(marketValue) || 0;
    const liab = parseFloat(liabilities) || 0;
    const shares = parseFloat(sharesOutstanding) || 1; // prevent division by zero
    setNav((mv - liab) / shares);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 NAV Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Net Asset Value (NAV)</strong> 
            reflects the per-share asset value of the REIT, calculated as total assets minus liabilities divided by shares outstanding.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            NAV Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">NAV</span> = ({" "}
            <span className="ml-2">Market Value of Real Estate</span> –{" "}
            <span className="ml-2">Liabilities</span> ) ÷{" "}
            <span className="ml-2">Shares Outstanding</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (₹ in crore, Shares in crore)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Market Value of Real Estate
              </label>
              <input
                type="number"
                value={marketValue}
                onChange={(e) => setMarketValue(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Liabilities
              </label>
              <input
                type="number"
                value={liabilities}
                onChange={(e) => setLiabilities(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 200"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Shares Outstanding (in crore)
              </label>
              <input
                type="number"
                value={sharesOutstanding}
                onChange={(e) => setSharesOutstanding(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
            </div>

            <button
              onClick={calculateNAV}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate NAV
            </button>

            {nav !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                NAV = ₹{nav.toFixed(2)} per share
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NAVCalculator;
