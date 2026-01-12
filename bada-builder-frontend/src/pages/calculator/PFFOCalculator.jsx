import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const PFFOCalculator = () => {
  const [pricePerShare, setPricePerShare] = useState("");
  const [ffoPerShare, setFfoPerShare] = useState("");
  const [pffo, setPffo] = useState(null);

  const calculatePFFO = () => {
    const price = parseFloat(pricePerShare) || 0;
    const ffo = parseFloat(ffoPerShare) || 0;

    if (ffo === 0) {
      setPffo("N/A");
    } else {
      setPffo(price / ffo);
    }
  };

  const formulaLatex = `
    \\text{P/FFO} = \\frac{\\text{Price per Share}}{\\text{FFO per Share}}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            📊 P/FFO Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Price-to-FFO Ratio (P/FFO)</strong> is a key valuation metric used for REITs, similar to P/E for traditional equities. It helps investors understand how much they are paying for each unit of recurring cash earnings.
          </p>

          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            P/FFO Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <BlockMath math={formulaLatex} />
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Price per Share (₹)
              </label>
              <input
                type="number"
                value={pricePerShare}
                onChange={(e) => setPricePerShare(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 150"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                FFO per Share (₹)
              </label>
              <input
                type="number"
                value={ffoPerShare}
                onChange={(e) => setFfoPerShare(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>

            <button
              onClick={calculatePFFO}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate P/FFO
            </button>

            {pffo !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                P/FFO = {pffo === "N/A" ? "N/A" : `${pffo.toFixed(2)}x`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PFFOCalculator;
