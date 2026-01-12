import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const TotalReturnCalculator = () => {
  const [initialPrice, setInitialPrice] = useState("");
  const [endingPrice, setEndingPrice] = useState("");
  const [dividends, setDividends] = useState("");
  const [totalReturn, setTotalReturn] = useState(null);

  const calculateTotalReturn = () => {
    const initial = parseFloat(initialPrice) || 0;
    const ending = parseFloat(endingPrice) || 0;
    const divs = parseFloat(dividends) || 0;

    if (initial === 0) {
      setTotalReturn(null);
      return;
    }

    const returnValue = ((ending - initial + divs) / initial) * 100;
    setTotalReturn(returnValue);
  };

  const formulaLatex = `
    \\text{Total Return} = \\frac{(\\text{Ending Price} - \\text{Initial Price}) + \\text{Dividends}}{\\text{Initial Price}}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            📊 Total Return Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Total Return</strong> measures the overall return of an investment, combining capital appreciation and income (like dividends), relative to the initial investment.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            Total Return Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-sm leading-relaxed break-words">
            <BlockMath math={formulaLatex} />
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Investment Details (₹ in crore)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Initial Price
              </label>
              <input
                type="number"
                value={initialPrice}
                onChange={(e) => setInitialPrice(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Ending Price
              </label>
              <input
                type="number"
                value={endingPrice}
                onChange={(e) => setEndingPrice(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 120"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Dividends Received
              </label>
              <input
                type="number"
                value={dividends}
                onChange={(e) => setDividends(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>

            <button
              onClick={calculateTotalReturn}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate Total Return
            </button>

            {totalReturn !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                Total Return = {totalReturn.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalReturnCalculator;
