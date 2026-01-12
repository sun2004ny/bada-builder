import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const FFOCalculator = () => {
  const [netIncome, setNetIncome] = useState("");
  const [depreciation, setDepreciation] = useState("");
  const [gains, setGains] = useState("");
  const [ffo, setFfo] = useState(null);

  const calculateFFO = () => {
    const ni = parseFloat(netIncome) || 0;
    const da = parseFloat(depreciation) || 0;
    const gs = parseFloat(gains) || 0;
    setFfo(ni + da - gs);
  };

  const formulaLatex = `
    \\text{FFO} = \\text{Net Income} + \\text{Depreciation \\& Amortization} - \\text{Gains on Sale of Properties}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 FFO Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Funds from Operations (FFO) {" "}</strong> 
            represents recurring income from core real estate operations, 
            excluding non-cash and one-time items. FFO is a key metric in REIT valuation used to measure cash generation.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            FFO Formula:
          </h2>
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
  <span className="font-semibold text-blue-900">FFO</span> = 
  <span className="ml-2">Net Income</span> + 
  <span className="ml-2">Depreciation &amp; Amortization</span> – 
  <span className="ml-2">Gains on Sale of Properties</span>
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
                Net Income
              </label>
              <input
                type="number"
                value={netIncome}
                onChange={(e) => setNetIncome(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Depreciation & Amortization
              </label>
              <input
                type="number"
                value={depreciation}
                onChange={(e) => setDepreciation(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Gains on Sale of Property
              </label>
              <input
                type="number"
                value={gains}
                onChange={(e) => setGains(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
              />
            </div>

            <button
  onClick={calculateFFO}
  className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"

>
  Calculate FFO
</button>


            {ffo !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                FFO = ₹{ffo.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FFOCalculator;
