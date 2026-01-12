import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

const OccupancyRateCalculator = () => {
  const [leasedSpace, setLeasedSpace] = useState("");
  const [totalSpace, setTotalSpace] = useState("");
  const [occupancyRate, setOccupancyRate] = useState(null);

  const calculateOccupancyRate = () => {
    const leased = parseFloat(leasedSpace) || 0;
    const total = parseFloat(totalSpace) || 0;
    if (total > 0) {
      setOccupancyRate((leased / total) * 100);
    } else {
      setOccupancyRate(null);
    }
  };

  const formulaLatex = `
    \\text{Occupancy Rate} = \\frac{\\text{Leased Space}}{\\text{Total Available Space}} \\times 100
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-20 to-blue-140 p-6 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-800 mb-6 leading-tight">
            🏢 Occupancy Rate Calculator
          </h1>
          <p className="text-gray-700 text-lg mb-4">
            <strong className="text-blue-700">Occupancy Rate</strong> measures the efficiency of leased commercial space.
            It shows the percentage of total available space that is currently leased.
          </p>
          <h2 className="text-xl text-blue-700 font-semibold mt-6 mb-2">
            Occupancy Rate Formula:
          </h2>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-gray-800 text-lg leading-relaxed break-words">
            <BlockMath math={formulaLatex} />
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-blue-50 p-6 rounded-xl shadow-inner border border-blue-200">
          <h3 className="text-2xl font-semibold text-blue-800 mb-6 text-start">
            Enter Values (sq.ft)
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Leased Space
              </label>
              <input
                type="number"
                value={leasedSpace}
                onChange={(e) => setLeasedSpace(e.target.value)}
                className="w-full text-start border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 90000"
              />
            </div>

            <div>
              <label className="block text-start text-blue-900 font-medium mb-1">
                Total Available Space
              </label>
              <input
                type="number"
                value={totalSpace}
                onChange={(e) => setTotalSpace(e.target.value)}
                className="w-full border border-blue-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100000"
              />
            </div>

            <button
              onClick={calculateOccupancyRate}
              className="w-full !bg-black !text-white py-3 rounded-lg text-lg font-semibold !hover:bg-gray-700 transition duration-200 mt-2"
            >
              Calculate Occupancy Rate
            </button>

            {occupancyRate !== null && (
              <div className="text-start mt-6 text-xl text-green-700 font-semibold">
                Occupancy Rate = {occupancyRate.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyRateCalculator;
