import React from 'react';
// No need to import RADD.css here if all styling is done with Tailwind,
// except for the custom scrollbar which can be globally applied or handled.

const RADD = () => {
    // Data extracted from the Word document
    const riskAssessmentPoints = [
        {
            title: "Market Risk",
            items: [
                { text: "Economic Cycles:", description: "REIT performance is sensitive to macroeconomic conditions (e.g., GDP growth, inflation, interest rates)." },
                { text: "Real Estate Market Trends:", description: "Property values and rental demand fluctuate with supply-demand dynamics." }
            ]
        },
        {
            title: "Interest Rate Risk",
            items: [
                { text: "REITs are highly sensitive to interest rate changes." },
                { text: "Rising rates increase borrowing costs and reduce the relative attractiveness of REIT dividends compared to bonds." }
            ]
        },
        {
            title: "Credit Risk",
            items: [
                { text: "Related to tenants' ability to pay rent." },
                { text: "Concentrated tenant profiles increase vulnerability to defaults." }
            ]
        },
        {
            title: "Operational Risk",
            items: [
                { text: "Poor property management or delays in construction, maintenance issues, and tenant disputes can hurt performance." }
            ]
        },
        {
            title: "Liquidity Risk",
            items: [
                { text: "Public REITs are generally liquid; private or unlisted REITs can have restrictions on withdrawal or secondary sales." }
            ]
        },
        {
            title: "Regulatory & Compliance Risk",
            items: [
                { text: "Tax law changes (e.g., loss of REIT tax status), zoning changes, and other legal issues can affect returns." }
            ]
        },
        {
            title: "Environmental and ESG Risks",
            items: [
                { text: "Sustainability compliance and exposure to environmental liabilities (e.g., contamination, flood zones)." }
            ]
        },
    ];

    const dueDiligenceProcessPoints = [
        {
            title: "Sponsor/Management Evaluation",
            items: [
                "Track record of the REIT sponsor and leadership team.",
                "Previous project performance, experience in real estate, transparency, and reputation."
            ]
        },
        {
            title: "Asset Quality Review",
            items: [
                "Type, location, and class of real estate assets (residential, commercial, industrial, etc.).",
                "Property age, occupancy rates, and tenant mix.",
                "Valuation reports and third-party appraisals."
            ]
        },
        {
            title: "Financial Analysis",
            items: [
                "Net Asset Value (NAV) vs. market price (for listed REITs).",
                "Debt-to-equity ratio and debt servicing capability.",
                "Dividend yield and payout history.",
                "Revenue growth, cost structure, and expense ratios."
            ]
        },
        {
            title: "Legal & Regulatory Review",
            items: [
                "Verify REIT registration, compliance with SEBI (India), SEC (U.S.), or relevant local laws.",
                "Lease agreements, title ownership, encumbrances, and litigation checks."
            ]
        },
        {
            title: "Tax Considerations",
            items: [
                "Review the REIT’s tax structure and implications for investors (withholding tax, DDT, etc.).",
                "Jurisdiction-specific tax treaties for foreign investors."
            ]
        },
        {
            title: "Exit Strategy",
            items: [
                "Availability of secondary market.",
                "Lock-in periods (for private REITs).",
                "Historical liquidity events (e.g., redemptions, buybacks)."
            ]
        },
        {
            title: "Environmental & Technical Due Diligence",
            items: [
                "Building condition reports.",
                "Environmental audits (e.g., Phase I ESA).",
                "Compliance with sustainability norms (e.g., LEED, IGBC)."
            ]
        },
    ];

    const bestPractices = [
        "Use third-party consultants for independent verification.",
        "Create a risk matrix to prioritize and monitor high-impact risks.",
        "Establish a governance framework to oversee compliance, ethics, and ESG standards."
    ];

    const riskMatrixData = [
        ["Market Risk", "Real estate price correction", "Medium", "High", "High", "Diversify across regions and asset types"],
        ["Interest Rate Risk", "Rising interest rates", "High", "Medium", "High", "Use fixed-rate debt; hedge interest rate exposure"],
        ["Credit Risk", "Major tenant default", "Medium", "High", "High", "Maintain diversified tenant base; use credit checks"],
        ["Operational Risk", "Poor property management", "Medium", "Medium", "Medium", "Hire professional property managers"],
        ["Liquidity Risk", "Redemption pressure in private REIT", "Low", "High", "Medium", "Lock-in periods; build liquidity reserves"],
        ["Regulatory Risk", "Changes in REIT tax structure", "Low", "High", "Medium", "Maintain legal compliance; monitor regulatory updates"],
        ["ESG/Environmental Risk", "Exposure to non-compliant or contaminated assets", "Medium", "Medium", "Medium", "Conduct environmental audits; invest in ESG-compliant assets"],
        ["Geographic Concentration", "Exposure to one city or state", "Medium", "High", "High", "Geographic diversification of portfolio"],
        ["Construction Risk", "Delay or cost overrun in development projects", "Medium", "High", "High", "Use experienced developers and performance guarantees"],
    ];

    const riskLevelKey = [
        { level: "Low", description: "Acceptable with routine monitoring" },
        { level: "Medium", description: "Requires ongoing management" },
        { level: "High", description: "Needs active mitigation or reconsideration" },
    ];

    const dueDiligenceChecklist = [
        {
            title: "Sponsor & Management",
            items: [
                "Background check on sponsor/promoter",
                "Track record of past projects (IRR, exit timelines)",
                "Corporate governance structure",
                "Conflicts of interest disclosure"
            ]
        },
        {
            title: "Legal & Regulatory",
            items: [
                "SEBI/SEC or relevant registration/license",
                "Property title due diligence (ownership verification)",
                "Review of all lease/rental agreements",
                "Litigation history or ongoing disputes",
                "Zoning and land use compliance"
            ]
        },
        {
            title: "Financials",
            items: [
                "Latest audited financial statements",
                "NAV calculation methodology",
                "Debt details – type, tenure, interest, covenants",
                "Dividend policy and history",
                "Rent collection efficiency and arrears"
            ]
        },
        {
            title: "Asset Portfolio",
            items: [
                "Location and valuation of each asset",
                "Occupancy and vacancy rates",
                "Tenant mix and lease expiry profile",
                "Condition assessment reports",
                "Insurance coverage (fire, liability, etc.)"
            ]
        },
        {
            title: "Taxation",
            items: [
                "Tax structure of the REIT",
                "Withholding taxes applicable to investors",
                "Double Tax Avoidance Agreement (DTAA) considerations (for foreign investors)"
            ]
        },
        {
            title: "ESG & Environmental",
            items: [
                "Environmental Impact Assessment (EIA)",
                "Green certifications (LEED, IGBC, etc.)",
                "Climate risk analysis (flood, heat zones)",
                "Energy efficiency & waste management policies"
            ]
        },
        {
            title: "Exit & Liquidity",
            items: [
                "Secondary market presence (for public REITs)",
                "Redemption terms (for private REITs)",
                "Historical exit performance",
                "Portfolio rebalancing options"
            ]
        },
    ];

    const optionalAddOns = [
        "Editable Risk Matrix Template",
        "Due Diligence Checklist with progress tracking columns",
        "Financial Ratios Dashboard for REIT evaluation"
    ];


    return (
        // Main container with responsive padding and a light background
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            {/* Central content wrapper with max-w, shadows, and rounded corners */}
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    RISK ASSESSMENT AND DUE DILIGENCE IN REITs
                </h1>
                {/* Introduction Paragraph */}
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                    Risk assessment and due diligence are critical components in the evaluation and management of Real Estate Investment Trusts (REITs). Below is a detailed breakdown of both aspects:
                </p>

                {/* Risk Assessment Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        {/* Using a larger, colored emoji for visual emphasis */}
                        <span className="text-green-600 text-4xl mr-4">✔️</span> Risk Assessment in REITs
                    </h2>
                    <p className="text-base text-gray-700 mb-8 leading-relaxed">
                        Risk assessment involves identifying, analyzing, and evaluating potential risks that may affect the performance and returns of a REIT. Key risks include:
                    </p>

                    {/* Grid layout for risk assessment points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {riskAssessmentPoints.map((risk, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                                    {/* Using a small circle icon for list items */}
                                    <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                                    {`${index + 1}. ${risk.title}`}
                                </h3>
                                <ul className="list-none text-gray-700 space-y-2">
                                    {risk.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start">
                                            {/* Custom bullet point */}
                                            <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                            <span className="flex-1">
                                                {item.text && <strong className="font-medium text-gray-800">{item.text}</strong>}
                                                {item.description && ` ${item.description}`}
                                                {!item.text && !item.description && item} {/* Fallback for simple strings */}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Due Diligence Process Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-blue-600 text-4xl mr-4">🔎</span> Due Diligence Process for REIT Investments
                    </h2>
                    <p className="text-base text-gray-700 mb-8 leading-relaxed">
                        Proper due diligence helps identify and mitigate risks before committing capital. It should include:
                    </p>

                    {/* Grid layout for due diligence points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {dueDiligenceProcessPoints.map((dd, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-blue-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                                <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                                    <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                                    {`${index + 1}. ${dd.title}`}
                                </h3>
                                <ul className="list-none text-gray-700 space-y-2">
                                    {dd.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start">
                                            <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Best Practices Section */}
                <section className="mb-12 p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">💡</span> Best Practices
                    </h2>
                    <ul className="list-none text-gray-700 space-y-3 text-base leading-relaxed">
                        {bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-green-600 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1" dangerouslySetInnerHTML={{ __html: practice.replace('risk matrix', '<strong class="font-semibold text-blue-600">risk matrix</strong>').replace('governance framework', '<strong class="font-semibold text-blue-600">governance framework</strong>') }}></span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Risk Assessment Matrix Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📊</span> RISK ASSESSMENT MATRIX – REITs
                    </h2>

                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {["Risk Category", "Specific Risk", "Likelihood", "Impact", "Risk Level", "Mitigation Strategy"].map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {riskMatrixData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className={`px-4 py-3 whitespace-normal text-sm sm:text-base ${cellIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'} ${cell === 'High' ? 'text-red-600 font-bold' : cell === 'Medium' ? 'text-orange-500 font-bold' : cell === 'Low' ? 'text-green-600 font-bold' : ''}`}>
                                                {cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-blue-700 mt-10 mb-4 flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                        Risk Level Key:
                    </h3>
                    <ul className="list-none text-gray-700 space-y-2 text-base">
                        {riskLevelKey.map((keyItem, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">
                                    <strong className={`font-bold ${keyItem.level === 'High' ? 'text-red-600' : keyItem.level === 'Medium' ? 'text-orange-500' : 'text-green-600'}`}>{keyItem.level}:</strong> {keyItem.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Due Diligence Checklist Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-blue-600 text-4xl mr-4">📋</span> DUE DILIGENCE CHECKLIST – REITs
                    </h2>

                    <ol className="list-none text-gray-700 space-y-6 text-base leading-relaxed">
                        {dueDiligenceChecklist.map((checklist, index) => (
                            <li key={index} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-start mb-2"> {/* Adjusted margin-bottom */}
                                    <span className="inline-block w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <h4 className="font-bold text-blue-700 flex-1 leading-tight">
                                        {checklist.title}
                                    </h4>
                                </div>
                                <ul className="list-none ml-7 mt-1 space-y-2"> {/* Adjusted margin-left */}
                                    {checklist.items.map((item, itemIndex) => (
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

                {/* Optional Add-Ons Section */}
                <section className="p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">✨</span> Optional Add-Ons
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                        Would you like any of the following in editable Excel or Google Sheets format?
                    </p>
                    <ul className="list-none text-gray-700 space-y-3 text-base leading-relaxed">
                        {optionalAddOns.map((addon, index) => (
                            <li key={index} className="flex items-center">
                                <span className="text-green-600 text-xl mr-3">✅</span> {addon}
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default RADD;
