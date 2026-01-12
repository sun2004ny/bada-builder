import React from 'react'

const REITValuationCompliance = () => {
  // Data extracted from the Word document: REIT VALUATION AND COMPLIANCE.docx

  const reitValuation = {
      title: "REIT Valuation",
      introduction: "Valuing a REIT is different from valuing regular stocks due to its unique structure and income-based nature. Here are the main approaches:",
      approaches: [
          {
              name: "Net Asset Value (NAV)",
              formula: "NAV = (Market value of real estate assets - Liabilities) / Number of outstanding shares",
              description: "Reflects the fair market value of a REIT’s properties minus liabilities. Investors compare NAV per share to the market price to assess undervaluation or overvaluation."
          },
          {
              name: "Funds from Operations (FFO)",
              formula: "FFO = Net Income + Depreciation + Amortization - Gains from property sales",
              description: "Adjusts net income by removing non-cash items like depreciation. AFFO (Adjusted FFO) goes further by subtracting capital expenditures and routine maintenance."
          },
          {
              name: "Price-to-FFO Ratio (P/FFO)",
              description: "Similar to a P/E ratio for traditional stocks. Used to compare REITs within a sector (e.g., office, residential, retail)."
          },
          {
              name: "Discounted Cash Flow (DCF)",
              description: "Used less often due to real estate complexities. Projects future cash flows and discounts them back to present value."
          }
      ]
  };

  const reitCompliance = {
      title: "REIT Compliance",
      introduction: "REITs must follow specific regulatory requirements to maintain their tax-advantaged status. These vary by country but generally include:",
      usGuidelines: {
          country: "United States (IRS Guidelines)",
          rules: [
              { type: "Asset Tests", description: "At least 75% of total assets must be in real estate, cash, or U.S. Treasuries." },
              { type: "Income Tests", description: "At least 75% of gross income from rents or mortgage interest. At least 95% of income from the above or dividends, interest, etc." },
              { type: "Distribution Requirement", description: "Must distribute at least 90% of taxable income to shareholders annually." },
              { type: "Shareholder Rules", description: "Must have 100+ shareholders. No more than 50% of shares held by 5 or fewer individuals." },
              { type: "Organizational Requirements", description: "Must be a corporation, trust, or association. Managed by trustees or directors." }
          ]
      },
      indiaGuidelines: {
          country: "India (SEBI Guidelines)",
          rules: [
              { type: "Structure", description: "Registered with SEBI. Trustee, Sponsor, and Manager must be separate entities." },
              { type: "Minimum Public Holding", description: "At least 25% units must be held by the public." },
              { type: "Income", description: "At least 90% of net distributable cash flows must be distributed to investors." },
              { type: "Investment", description: "80% of assets must be in completed and income-generating properties." },
              { type: "Leverage", description: "Cannot exceed 49% of the value of REIT assets." }
          ]
      },
      comparisonTable: {
          headers: ["Metric / Rule", "U.S. REIT", "Indian REIT"],
          rows: [
              ["Minimum Payout", "90% of taxable income", "90% of net distributable cash"],
              ["Asset Allocation", "75% in real estate", "80% in completed, revenue-generating"],
              ["Income Test", "75% real estate, 95% total", "NA"],
              ["Public Shareholding", "100+ shareholders", "25% units with public"],
              ["Leverage Limit", "NA", "Max 49% of assets"]
          ]
      }
  };

  const reitFinancialModel = {
      title: "REIT Financial Model Template",
      introduction: "I'll outline the structure here and can provide an Excel/Google Sheet-compatible version upon request.",
      structure: [
          {
              name: "Inputs Sheet",
              items: [
                  "Property acquisition costs", "Expected rental yields", "Occupancy rates",
                  "Growth rates (rent, expenses)", "Maintenance and capital expenditures",
                  "Leverage terms (interest rate, LTV ratio)", "Exit cap rate"
              ]
          },
          {
              name: "Income Statement Projection (10–15 Years)",
              items: [
                  "Rental Income = Gross leasable area × Rent per sq ft × Occupancy",
                  "Less: Operating Expenses", "Less: Property Taxes, Maintenance",
                  "= Net Operating Income (NOI)"
              ]
          },
          {
              name: "FFO & AFFO Calculation",
              items: [
                  "FFO = Net Income + Depreciation + Amortization − Gains on sales",
                  "AFFO = FFO − Capital Expenditures − Leasing costs"
              ]
          },
          {
              name: "Cash Distribution Sheet",
              items: [
                  "Taxable income",
                  "Required minimum distribution (90% of taxable income or net distributable cash)",
                  "Surplus retained (if any)"
              ]
          },
          {
              name: "NAV Calculation",
              items: [
                  "Property Fair Market Value (based on NOI / Cap Rate)",
                  "Less: Debt", "= NAV", "NAV Per Share"
              ]
          },
          {
              name: "Investor Returns",
              items: [
                  "IRR (Internal Rate of Return)", "Equity Multiple", "Annual Yield", "Distribution Timeline"
              ]
          },
          {
              name: "Sensitivity Analysis",
              items: [
                  "Vary rent growth, cap rate, occupancy",
                  "See impact on NAV, returns"
              ]
          }
      ]
  };

  const legalComplianceAudits = {
      title: "Legal Setup & Compliance Audits (India-Focused)",
      entitiesRequired: {
          name: "Entities Required",
          items: [
              { type: "Sponsor", description: "Owns minimum 15% of REIT units for at least 3 years." },
              { type: "Trustee", description: "Registered with SEBI. Oversees operations in the interest of unitholders." },
              { type: "Manager", description: "Day-to-day management. Needs SEBI registration." }
          ]
      },
      sebiRegistrationProcess: {
          name: "SEBI Registration Process",
          items: [
              "Draft Trust Deed and get it registered.",
              "Submit application (Form A) to SEBI.",
              "Provide documents for:",
              "Sponsor financials and experience",
              "Manager background",
              "Trustee appointment",
              "Valuer details (independent, registered)"
          ]
      },
      ongoingCompliance: {
          name: "Ongoing Compliance",
          items: [
              "Annual valuation by SEBI-registered valuer.",
              "Quarterly disclosure of:",
              "Rental income", "NAV per unit", "Occupancy and lease expiry details",
              "Annual audit of financials",
              "Distribute 90% of net distributable cash flows",
              "No speculative development – 80% of assets must be income-generating"
          ]
      },
      auditRequirements: {
          name: "Audit Requirements",
          items: [
              "Internal audits of cash flows, operations",
              "External audits by SEBI-recognized auditors",
              "Compliance audit: Verify adherence to SEBI guidelines"
          ]
      }
  };

  return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
          <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

              {/* Main Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                  REIT Valuation & Compliance
              </h1>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                  "REIT Valuation & Compliance" is a crucial aspect of investing in and managing Real Estate Investment Trusts (REITs). Here's a breakdown of both components:
              </p>

              {/* REIT Valuation Section */}
              <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                      <span className="text-green-600 text-4xl mr-4">📊</span> {reitValuation.title}
                  </h2>
                  <p className="text-base text-gray-700 mb-8 leading-relaxed">
                      {reitValuation.introduction}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {reitValuation.approaches.map((approach, index) => (
                          <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                              <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                                  <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                                  {`${index + 1}. ${approach.name}`}
                              </h3>
                              {approach.formula && (
                                  <p className="text-sm font-mono bg-gray-100 p-3 rounded-md mb-3 text-gray-800 break-words">
                                      {approach.formula}
                                  </p>
                              )}
                              <p className="text-base text-gray-700 leading-relaxed">
                                  {approach.description}
                              </p>
                          </div>
                      ))}
                  </div>
              </section>

              {/* REIT Compliance Section */}
              <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                      <span className="text-blue-600 text-4xl mr-4">✅</span> {reitCompliance.title}
                  </h2>
                  <p className="text-base text-gray-700 mb-8 leading-relaxed">
                      {reitCompliance.introduction}
                  </p>

                  {/* US Guidelines */}
                  <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="text-red-500 text-2xl mr-2">🇺🇸</span> {reitCompliance.usGuidelines.country}
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {reitCompliance.usGuidelines.rules.map((rule, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">
                                      <strong className="font-medium">{rule.type}:</strong> {rule.description}
                                  </span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* India Guidelines */}
                  <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="text-orange-500 text-2xl mr-2">🇮🇳</span> {reitCompliance.indiaGuidelines.country}
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {reitCompliance.indiaGuidelines.rules.map((rule, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">
                                      <strong className="font-medium">{rule.type}:</strong> {rule.description}
                                  </span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Comparison Table */}
                  <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                      <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                      Comparison:
                  </h3>
                  <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                      <table className="min-w-full divide-y divide-blue-200">
                          <thead className="bg-blue-100">
                              <tr>
                                  {reitCompliance.comparisonTable.headers.map((header, index) => (
                                      <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                          {header}
                                      </th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-blue-100">
                              {reitCompliance.comparisonTable.rows.map((row, rowIndex) => (
                                  <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                      {row.map((cell, cellIndex) => (
                                          <td key={cellIndex} className={`px-4 py-3 whitespace-normal text-sm ${cellIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                              {cell}
                                          </td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </section>

              {/* REIT Financial Model Template Section */}
              <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                      <span className="text-green-600 text-4xl mr-4">🧮</span> {reitFinancialModel.title}
                  </h2>
                  <p className="text-base text-gray-700 mb-8 leading-relaxed">
                      {reitFinancialModel.introduction}
                  </p>
                  <ol className="list-none text-gray-700 space-y-6 text-base leading-relaxed">
                      {reitFinancialModel.structure.map((section, index) => (
                          <li key={index} className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                              <h3 className="font-bold text-blue-700 mb-3 flex items-center">
                                  <span className="inline-block w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3">{index + 1}</span>
                                  {section.name}
                              </h3>
                              <ul className="list-none ml-8 mt-1 space-y-2">
                                  {section.items.map((item, itemIndex) => (
                                      <li key={itemIndex} className="flex items-start">
                                          <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                          <span className="flex-1">{item}</span>
                                      </li>
                                  ))}
                              </ul>
                          </li>
                      ))}
                  </ol>
              </section>

              {/* Legal Setup & Compliance Audits Section */}
              <section className="p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                  <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                      <span className="text-green-600 text-4xl mr-4">⚖️</span> {legalComplianceAudits.title}
                  </h2>

                  {/* Entities Required */}
                  <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                          {legalComplianceAudits.entitiesRequired.name}:
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {legalComplianceAudits.entitiesRequired.items.map((entity, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">
                                      <strong className="font-medium">{entity.type}:</strong> {entity.description}
                                  </span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* SEBI Registration Process */}
                  <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                          {legalComplianceAudits.sebiRegistrationProcess.name}:
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {legalComplianceAudits.sebiRegistrationProcess.items.map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Ongoing Compliance */}
                  <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                          {legalComplianceAudits.ongoingCompliance.name}:
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {legalComplianceAudits.ongoingCompliance.items.map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>

                  {/* Audit Requirements */}
                  <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                          {legalComplianceAudits.auditRequirements.name}:
                      </h3>
                      <ul className="list-none text-gray-700 space-y-3">
                          {legalComplianceAudits.auditRequirements.items.map((item, index) => (
                              <li key={index} className="flex items-start">
                                  <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                  <span className="flex-1">{item}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </section>

          </div>
      </div>
  );
};

export default REITValuationCompliance;
