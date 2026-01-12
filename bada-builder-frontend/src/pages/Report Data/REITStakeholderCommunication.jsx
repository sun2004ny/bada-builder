import React from 'react';

const REITStakeholderCommunication = () => {
    // Data extracted from the Word document: Stakeholder Communication in Reit.docx

    const keyStakeholders = [
        "Investors/Shareholders",
        "Board of Directors",
        "Property/Asset Managers",
        "Tenants",
        "Regulatory Bodies (e.g., SEBI in India, SEC in the US)",
        "Auditors and Legal Advisors",
        "Credit Rating Agencies",
        "Financial Institutions (lenders, underwriters)"
    ];

    const coreObjectives = [
        "Ensure regulatory compliance",
        "Build and maintain investor trust",
        "Promote transparency on financial and operational performance",
        "Encourage strategic alignment among decision-makers",
        "Manage crises and risks proactively",
        "Facilitate capital raising and secondary offerings"
    ];

    const communicationMechanisms = {
        headers: ["Stakeholder", "Communication Method", "Frequency"],
        rows: [
            ["Investors", "Annual reports, investor presentations, emails", "Quarterly/Annual"],
            ["Board of Directors", "Board meetings, strategic memos", "Monthly/Quarterly"],
            ["Tenants", "Newsletters, service portals, notices", "Ongoing"],
            ["Regulators", "Compliance filings, audit reports", "As required"],
            ["Auditors", "Financial disclosures, review meetings", "Annually"],
            ["Public/Media", "Press releases, media briefings", "As needed"]
        ]
    };

    const keyDisclosures = [
        "Net Asset Value (NAV)",
        "Dividend Distribution",
        "Rental Income Performance",
        "Occupancy Rates",
        "Asset Acquisition/Disposition",
        "Market Outlook and Risk Factors"
    ];

    const bestPractices = [
        "Digital Portals: Provide dashboards for real-time investor updates.",
        "ESG Reporting: Communicate Environmental, Social, and Governance metrics.",
        "Q&A Sessions: Host periodic webinars or town halls for retail investors.",
        "Crisis Communication Plan: Maintain protocols for transparency during economic downturns, tenant defaults, or regulatory actions.",
        "Tailored Messaging: Customize communication based on stakeholder needs (e.g., high-level summaries for investors, detailed reports for regulators)."
    ];

    const regulatoryCommunicationIndia = {
        introduction: "In India, listed REITs must comply with SEBI (Real Estate Investment Trusts) Regulations. Mandatory communications include:",
        mandatoryCommunications: [
            "Half-yearly and annual financial reports",
            "Quarterly investor updates",
            "Related party transaction disclosures",
            "Valuation reports from registered valuers (semi-annual)",
            "Corporate governance compliance filings"
        ]
    };

    const communicationPlanTemplate = {
        introduction: "Here’s a clean, practical Stakeholder Communication Plan Template tailored for a REIT. It covers key stakeholder groups, communication goals, methods, frequency, and responsibilities.",
        headers: ["Stakeholder Group", "Communication Objective", "Communication Method", "Frequency", "Responsible Person/Team", "Notes/Comments"],
        rows: [
            ["Investors", "Inform about financial performance and strategy", "Quarterly reports, webinars, emails", "Quarterly + Annual", "Investor Relations Team", "Provide NAV updates, dividend info"],
            ["Board of Directors", "Review strategic decisions and governance", "Board meetings, memos", "Monthly/Quarterly", "CEO & Corporate Secretary", "Prepare agenda and minutes"],
            ["Tenants", "Ensure smooth operations and lease updates", "Newsletters, emails, tenant portal", "Monthly/Ongoing", "Property Management Team", "Address service requests promptly"],
            ["Regulators", "Fulfill legal and compliance requirements", "Financial filings, compliance reports", "As required", "Compliance Officer", "Submit timely reports to SEBI"],
            ["Auditors", "Facilitate financial auditing process", "Financial statements, meetings", "Annually", "CFO & Audit Committee", "Coordinate audit schedules"],
            ["Financial Institutions", "Provide updates on credit status and covenants", "Reports, meetings", "Quarterly", "Finance Team", "Update on debt servicing"],
            ["Media/Public", "Build brand and handle public relations", "Press releases, media briefings", "As needed", "PR Team", "Crisis communication plan in place"]
        ],
        howToUse: [
            { item: "Stakeholder Group:", description: "Identify your stakeholder." },
            { item: "Communication Objective:", description: "What you want to achieve." },
            { item: "Communication Method:", description: "How you will communicate." },
            { item: "Frequency:", description: "When or how often." },
            { item: "Responsible Person/Team:", description: "Who owns the communication." },
            { item: "Notes/Comments:", description: "Extra info or next steps." }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    Stakeholder Communication in REIT
                </h1>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                    Stakeholder communication in a Real Estate Investment Trust (REIT) is crucial for transparency, trust, and effective decision-making. Because REITs involve a wide range of stakeholders—such as investors, regulators, tenants, property managers, and board members—clear and consistent communication is essential.
                </p>

                {/* Key Stakeholders Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">🧩</span> Key Stakeholders in a REIT
                    </h2>
                    {/* Removed flex-1 and adjusted ml for tighter left alignment */}
                    <ul className="list-none text-gray-700 space-y-2 ml-4"> {/* Adjusted margin-left here */}
                        {keyStakeholders.map((stakeholder, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{stakeholder}</span> {/* Removed flex-1 from here */}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Core Objectives Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📢</span> Core Objectives of Stakeholder Communication
                    </h2>
                    {/* Applied ml-4 and removed flex-1 from the span */}
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {coreObjectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{objective}</span> {/* Removed flex-1 from here */}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Communication Mechanisms Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🛠️</span> Communication Mechanisms
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {communicationMechanisms.headers.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {communicationMechanisms.rows.map((row, rowIndex) => (
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

                {/* Key Disclosures to Investors Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📈</span> Key Disclosures to Investors
                    </h2>
                    {/* Applied ml-4 and removed flex-1 from the span */}
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {keyDisclosures.map((disclosure, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{disclosure}</span> {/* Removed flex-1 from here */}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Best Practices Section */}
                <section className="mb-12 p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">✅</span> Best Practices
                    </h2>
                    {/* Applied ml-4 and removed flex-1 from the span */}
                    <ul className="list-none text-gray-700 space-y-3 text-base leading-relaxed ml-4">
                        {bestPractices.map((practice, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-green-600 text-lg mr-2 mt-0.5">▪</span>
                                <span>{practice}</span> {/* Removed flex-1 from here */}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Regulatory Communication (India Example) Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🧮</span> Regulatory Communication (India Example)
                    </h2>
                    <p className="text-base text-gray-700 mb-8 leading-relaxed">
                        {regulatoryCommunicationIndia.introduction}
                    </p>
                    {/* Applied ml-4 and removed flex-1 from the span */}
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {regulatoryCommunicationIndia.mandatoryCommunications.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span> {/* Removed flex-1 from here */}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Stakeholder Communication Plan Template Section */}
                <section className="p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📋</span> Stakeholder Communication Plan Template
                    </h2>
                    <p className="text-base text-gray-700 mb-8 leading-relaxed">
                        {communicationPlanTemplate.introduction}
                    </p>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200 mb-8">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {communicationPlanTemplate.headers.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {communicationPlanTemplate.rows.map((row, rowIndex) => (
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
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                        How to Use the Template:
                    </h3>
                    {/* Applied ml-4 and removed flex-1 from the span */}
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {communicationPlanTemplate.howToUse.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>
                                    <strong className="font-medium">{item.item}</strong> {item.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

            </div>
        </div>
    );
};

export default REITStakeholderCommunication;
