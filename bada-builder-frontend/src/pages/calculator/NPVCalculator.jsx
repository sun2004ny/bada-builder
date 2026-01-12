import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const NPVCalculator = () => {
  const [dcf, setDcf] = useState("");
  const [investment, setInvestment] = useState("");
  const [npv, setNpv] = useState(null);

  const calculateNPV = () => {
    const dcfValue = parseFloat(dcf) || 0;
    const investmentValue = parseFloat(investment) || 0;
    setNpv(dcfValue - investmentValue);
  };

  const formulaLatex = `
    \\text{NPV} = \\text{DCF} - \\text{Initial Investment}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            💸 NPV Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Net Present Value (NPV)</strong> is used to evaluate the profitability of an investment by subtracting the initial cost from the present value of expected future cash flows (DCF).
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            NPV Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed">
            <BlockMath math={formulaLatex} />
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
                Discounted Cash Flow (DCF)
              </label>
              <input
                type="number"
                value={dcf}
                onChange={(e) => setDcf(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 75.82"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Initial Investment
              </label>
              <input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 70"
              />
            </div>

            <button
              onClick={calculateNPV}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate NPV
            </button>

            {npv !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                NPV = ₹{npv.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPVCalculator;
