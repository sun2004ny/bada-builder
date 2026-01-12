import React, { useState } from "react";

const DividendYieldCalculator = () => {
  const [dividend, setDividend] = useState("");
  const [sharePrice, setSharePrice] = useState("");
  const [yieldResult, setYieldResult] = useState(null);

  const calculateDividendYield = () => {
    const dps = parseFloat(dividend) || 0;
    const sp = parseFloat(sharePrice) || 1; // avoid divide-by-zero
    const result = dps / sp;
    setYieldResult(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            💰 Dividend Yield Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Dividend Yield</strong> measures the income return on an investment. 
            It shows how much a company pays out in dividends each year relative to its share price.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            Dividend Yield Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">Dividend Yield</span> = 
            <span className="ml-2">Annual Dividend per Share</span> ÷ 
            <span className="ml-2">Share Price</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (₹)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Annual Dividend per Share
              </label>
              <input
                type="number"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 9"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Share Price
              </label>
              <input
                type="number"
                value={sharePrice}
                onChange={(e) => setSharePrice(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150"
              />
            </div>

            <button
              onClick={calculateDividendYield}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate Dividend Yield
            </button>

            {yieldResult !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                Dividend Yield = {(yieldResult * 100).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DividendYieldCalculator;
