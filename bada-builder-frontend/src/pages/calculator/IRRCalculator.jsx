import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const IRRCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [cashFlowsInput, setCashFlowsInput] = useState("");
  const [irr, setIrr] = useState(null);

  const calculateIRR = () => {
    const initial = -Math.abs(parseFloat(initialInvestment)) || 0;
    const cashFlows = cashFlowsInput
      .split(",")
      .map((cf) => parseFloat(cf.trim()))
      .filter((cf) => !isNaN(cf));

    const values = [initial, ...cashFlows];

    const guess = 0.1;
    const maxIterations = 1000;
    const precision = 1e-6;

    const irrCalc = (vals, guess) => {
      let rate = guess;

      for (let i = 0; i < maxIterations; i++) {
        let npv = 0;
        let dnpv = 0;

        for (let t = 0; t < vals.length; t++) {
          npv += vals[t] / Math.pow(1 + rate, t);
          if (t !== 0) {
            dnpv -= t * vals[t] / Math.pow(1 + rate, t + 1);
          }
        }

        const newRate = rate - npv / dnpv;
        if (Math.abs(newRate - rate) < precision) return newRate;
        rate = newRate;
      }
      return null;
    };

    const result = irrCalc(values, guess);
    setIrr(result ? result * 100 : null);
  };

  const formulaLatex = `
    0 = -\\text{Initial Investment} + \\sum_{t=1}^{n} \\frac{\\text{Cash Flow}_t}{(1 + \\text{IRR})^t}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            📈 IRR Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Internal Rate of Return (IRR)</strong> measures the annualized return of an investment. It is the discount rate that makes the Net Present Value (NPV) of all future cash flows equal to zero.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            IRR Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <BlockMath math={formulaLatex} />
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Investment Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Initial Investment (₹ crore)
              </label>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Annual Cash Flows (comma-separated)
              </label>
              <input
                type="text"
                value={cashFlowsInput}
                onChange={(e) => setCashFlowsInput(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20,20,20,20,20"
              />
            </div>

            <button
              onClick={calculateIRR}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate IRR
            </button>

            {irr !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                IRR = {irr.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IRRCalculator;
