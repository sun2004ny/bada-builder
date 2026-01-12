import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const EBITDAreCalculator = () => {
  const [netIncome, setNetIncome] = useState("");
  const [interest, setInterest] = useState("");
  const [taxes, setTaxes] = useState("");
  const [depreciation, setDepreciation] = useState("");
  const [impairment, setImpairment] = useState("");
  const [losses, setLosses] = useState("");
  const [ebitdare, setEbitdare] = useState(null);

  const calculateEBITDAre = () => {
    const ni = parseFloat(netIncome) || 0;
    const int = parseFloat(interest) || 0;
    const tax = parseFloat(taxes) || 0;
    const da = parseFloat(depreciation) || 0;
    const imp = parseFloat(impairment) || 0;
    const los = parseFloat(losses) || 0;

    setEbitdare(ni + int + tax + da + imp + los);
  };

  const formulaLatex = `
    \\text{EBITDAre} = \\text{Net Income} + \\text{Interest} + \\text{Taxes} + \\text{Depreciation \\& Amortization} + \\text{Impairment} + \\text{Losses on Disposition}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 EBITDAre Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">EBITDAre</strong> represents an industry-standard REIT performance metric. It reflects recurring operating earnings from core real estate operations by adding back interest, taxes, D&A, impairment, and losses.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            EBITDAre Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            {/* <BlockMath math={formulaLatex} /> */}
            EBITDAre = Net Income + Interest + Taxes + D&A + Impairment + Losses on Disposition
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (₹ in crore)
          </h3>

          <div className="space-y-4">
            {[
              { label: "Net Income", value: netIncome, set: setNetIncome },
              { label: "Interest", value: interest, set: setInterest },
              { label: "Taxes", value: taxes, set: setTaxes },
              { label: "Depreciation & Amortization", value: depreciation, set: setDepreciation },
              { label: "Impairment", value: impairment, set: setImpairment },
              { label: "Losses on Disposition", value: losses, set: setLosses }
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-start text-blue-900 font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., 1`}
                />
              </div>
            ))}

            <button
              onClick={calculateEBITDAre}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate EBITDAre
            </button>

            {ebitdare !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                EBITDAre = ₹{ebitdare.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBITDAreCalculator;
