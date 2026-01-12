import React, { useState } from "react";

const CapRateCalculator = () => {
  const [noi, setNoi] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [capRate, setCapRate] = useState(null);

  const calculateCapRate = () => {
    const noiValue = parseFloat(noi) || 0;
    const propValue = parseFloat(propertyValue) || 1; // avoid division by zero
    setCapRate((noiValue / propValue) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 Cap Rate Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Capitalization Rate (Cap Rate){" "}</strong>
            measures the rate of return on a real estate investment property based on the income that the property is expected to generate.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            Cap Rate Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">Cap Rate</span> ={" "}
            <span className="ml-2">NOI</span> ÷ <span className="ml-2">Property Value</span> × 100%
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
                NOI (Net Operating Income)
              </label>
              <input
                type="number"
                value={noi}
                onChange={(e) => setNoi(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Property Value
              </label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150"
              />
            </div>

            <button
              onClick={calculateCapRate}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate Cap Rate
            </button>

            {capRate !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                Cap Rate = {capRate.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapRateCalculator;
