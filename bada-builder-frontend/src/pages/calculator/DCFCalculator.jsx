import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const DCFCalculator = () => {
  const [cashFlows, setCashFlows] = useState(["", "", "", "", ""]);
  const [discountRate, setDiscountRate] = useState("");
  const [dcf, setDcf] = useState(null);

  const handleCashFlowChange = (index, value) => {
    const updated = [...cashFlows];
    updated[index] = value;
    setCashFlows(updated);
  };

  const calculateDCF = () => {
    const r = parseFloat(discountRate) / 100 || 0;
    const result = cashFlows.reduce((acc, cf, i) => {
      const flow = parseFloat(cf) || 0;
      return acc + flow / Math.pow(1 + r, i + 1);
    }, 0);
    setDcf(result);
  };

  const formulaLatex = `
    \\text{DCF} = \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t}
  `;

    const formulaLatex2 = `
    \\text{DCF} = \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t} + \\frac{TV}{(1 + r)^n}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 DCF Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Discounted Cash Flow (DCF)</strong> is a valuation method
            used to estimate the value of an investment based on its expected future cash flows. In 
            <strong> Real Estate Investment Trusts (REITs),</strong> DCF helps assess the present value of future income
            from properties, adjusted for time and risk.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">DCF Formula:</h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed">
            <BlockMath math={formulaLatex} />
          </div>
          <p className="text-gray-300">or</p>
          <div className="bg-blue-50 -mt-2 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed">
            <BlockMath math={formulaLatex2} />
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (₹ in crore)
          </h3>

          <div className="space-y-4">
            {cashFlows.map((cf, index) => (
              <div key={index}>
                <label className="block text-start text-blue-900 font-medium mb-1">
                  Cash Flow Year {index + 1}
                </label>
                <input
                  type="number"
                  value={cf}
                  onChange={(e) => handleCashFlowChange(index, e.target.value)}
                  className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., 20`}
                />
              </div>
            ))}

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Discount Rate (%)
              </label>
              <input
                type="number"
                value={discountRate}
                onChange={(e) => setDiscountRate(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
              />
            </div>

            <button
              onClick={calculateDCF}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate DCF
            </button>

            {dcf !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                DCF = ₹{dcf.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DCFCalculator;



// other version of DCF ===========================================

// import React, { useState } from "react";
// import "katex/dist/katex.min.css";
// import { BlockMath } from "react-katex";

// const DCFCalculator = () => {
//   const [cashFlows, setCashFlows] = useState(["", "", "", "", ""]);
//   const [discountRate, setDiscountRate] = useState("");
//   const [terminalValue, setTerminalValue] = useState("");
//   const [dcf, setDcf] = useState(null);

//   const handleCashFlowChange = (index, value) => {
//     const updated = [...cashFlows];
//     updated[index] = value;
//     setCashFlows(updated);
//   };

//   const calculateDCF = () => {
//     const r = parseFloat(discountRate) / 100 || 0;
//     const tv = parseFloat(terminalValue) || 0;

//     const cashFlowSum = cashFlows.reduce((acc, cf, i) => {
//       const flow = parseFloat(cf) || 0;
//       return acc + flow / Math.pow(1 + r, i + 1);
//     }, 0);

//     const discountedTV = tv / Math.pow(1 + r, cashFlows.length);
//     setDcf(cashFlowSum + discountedTV);
//   };

  // const formulaLatex = `
  //   \\text{DCF} = \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t} + \\frac{TV}{(1 + r)^n}
  // `;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
//       <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
//         {/* Left Side */}
//         <div className="flex flex-col justify-center">
//           <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
//             🏢 DCF Calculator
//           </h1>
//           <p className="text-gray-700 text-lg mb-4">
//             <strong className="text-blue-700">Discounted Cash Flow (DCF)</strong> is a valuation method
//             used to estimate the value of an investment based on its expected future cash flows. In 
//             <strong> Real Estate Investment Trusts (REITs),</strong> DCF helps assess the present value of future income
//             from properties, adjusted for time and risk.
//           </p>
//           <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">DCF Formula:</h2>
//           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed">
//             <BlockMath math={formulaLatex} />
//           </div>
//         </div>

//         {/* Right Side */}
//         <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
//           <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
//             Enter Values (₹ in crore)
//           </h3>

//           <div className="space-y-4">
//             {cashFlows.map((cf, index) => (
//               <div key={index}>
//                 <label className="block text-start text-blue-900 font-medium mb-1">
//                   Cash Flow Year {index + 1}
//                 </label>
//                 <input
//                   type="number"
//                   value={cf}
//                   onChange={(e) => handleCashFlowChange(index, e.target.value)}
//                   className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g., 20"
//                 />
//               </div>
//             ))}

//             <div>
//               <label className="block text-start text-blue-900 font-medium mb-1">
//                 Terminal Value
//               </label>
//               <input
//                 type="number"
//                 value={terminalValue}
//                 onChange={(e) => setTerminalValue(e.target.value)}
//                 className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g., 50"
//               />
//             </div>

//             <div>
//               <label className="block text-start text-blue-900 font-medium mb-1">
//                 Discount Rate (%)
//               </label>
//               <input
//                 type="number"
//                 value={discountRate}
//                 onChange={(e) => setDiscountRate(e.target.value)}
//                 className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="e.g., 10"
//               />
//             </div>

//             <button
//               onClick={calculateDCF}
//               className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
//             >
//               Calculate DCF
//             </button>

//             {dcf !== null && (
//               <div className="text-start mt-6 text-xl text-green-700 font-semibold">
//                 DCF = ₹{dcf.toFixed(2)} crore
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DCFCalculator;
