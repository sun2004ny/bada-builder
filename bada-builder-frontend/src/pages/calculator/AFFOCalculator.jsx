import React, { useState } from "react";

const AFFOCalculator = () => {
  const [ffo, setFfo] = useState("");
  const [capex, setCapex] = useState("");
  const [rentAdjustments, setRentAdjustments] = useState("");
  const [leasingCosts, setLeasingCosts] = useState("");
  const [affo, setAffo] = useState(null);

  const calculateAFFO = () => {
    const f = parseFloat(ffo) || 0;
    const c = parseFloat(capex) || 0;
    const r = parseFloat(rentAdjustments) || 0;
    const l = parseFloat(leasingCosts) || 0;
    setAffo(f - c - r - l);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🧾 AFFO Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">
              Adjusted Funds from Operations (AFFO){" "}
            </strong>
            reflects the actual distributable cash flow by adjusting FFO for capital expenditures, straight-line rent adjustments, and leasing costs. It is a more accurate representation of cash available to shareholders.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            AFFO Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <span className="font-semibold text-blue-900">AFFO</span> ={" "}
            <span className="ml-2">FFO</span> –{" "}
            <span className="ml-2">Capital Expenditures</span> –{" "}
            <span className="ml-2">Straight-line Rent Adjustments</span> –{" "}
            <span className="ml-2">Leasing Costs</span>
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
                FFO
              </label>
              <input
                type="number"
                value={ffo}
                onChange={(e) => setFfo(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 13"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Capital Expenditures
              </label>
              <input
                type="number"
                value={capex}
                onChange={(e) => setCapex(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Straight-line Rent Adjustments
              </label>
              <input
                type="number"
                value={rentAdjustments}
                onChange={(e) => setRentAdjustments(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.5"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Leasing Costs
              </label>
              <input
                type="number"
                value={leasingCosts}
                onChange={(e) => setLeasingCosts(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.5"
              />
            </div>

            <button
              onClick={calculateAFFO}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate AFFO
            </button>

            {affo !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                AFFO = ₹{affo.toFixed(2)} crore
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AFFOCalculator;
