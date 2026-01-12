import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const DCFCalculator = () => {
  const latex = `
    \\text{DCF} = \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t} + \\frac{TV}{(1 + r)^n}
  `;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter flex items-center justify-center">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-100 text-center">
        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
          DCF Calculator
        </h1>

        <p className="text-lg text-gray-700 mt-8 leading-relaxed">
          <div>
            <strong>Discounted Cash Flow (DCF)</strong> is a valuation method
            used to estimate the value of an investment based on its expected
            future cash flows. In{" "}
            <strong>Real Estate Investment Trusts (REITs),</strong> DCF helps
            assess the present value of future income from properties, adjusted
            for time and risk.
          </div>

          <div>
            <h1>DCF Formula for REIT Valuation</h1>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">
                DCF Formula for REIT Valuation
              </h2>
              <BlockMath math={latex} />
            </div>
          </div>
        </p>
      </div>
    </div>
  );
};

export default DCFCalculator;
