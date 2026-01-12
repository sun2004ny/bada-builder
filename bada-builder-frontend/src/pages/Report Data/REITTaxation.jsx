import React from 'react';

const REITTaxation = () => {
    // Data extracted from the Word document: Taxation in REITS.docx

    const taxStructureREITLevel = {
        title: "Tax Structure at the REIT Level",
        passThroughConcept: {
            heading: "REITs Generally Enjoy Pass-Through Taxation",
            description: "REITs do not pay corporate income tax on most of their earnings, provided they distribute a significant portion of their income (usually 90% or more) to investors as dividends. This prevents 'double taxation' (tax at both corporate and investor levels)."
        },
        eligibilityConditions: {
            heading: "Eligibility Conditions (General)",
            items: [
                "Distribute at least 90% of taxable income.",
                "Derive most income from real estate-related sources (rent, interest on mortgages).",
                "Invest a large portion of assets in real estate.",
                "Be structured as a public company in most jurisdictions."
            ],
            failureConsequence: "If a REIT fails to meet requirements: It may be taxed like a regular corporation, facing full corporate income tax on its earnings."
        }
    };

    const taxationInvestorLevel = {
        title: "Taxation at the Investor Level",
        introduction: "Investors are taxed when they receive distributions or sell REIT units.",
        typesOfIncome: [
            "Dividend Income",
            "Interest Income",
            "Capital Gains (from sale of REIT units)"
        ],
        dividendIncome: {
            heading: "Dividend Income",
            general: "Typically taxed as ordinary income for investors. In some countries, part of the dividend may be return of capital (not taxable initially but reduces cost basis).",
            usExample: {
                heading: "U.S. Example:",
                items: [
                    "Qualified REIT dividends are taxed at ordinary income tax rates (not lower dividend rates).",
                    "May be eligible for a 20% deduction under the QBI (Qualified Business Income) rules."
                ]
            },
            indiaExample: {
                heading: "India Example:",
                items: [
                    "Dividends received from REITs are exempt in the hands of investors if the REIT doesn’t pay DDT.",
                    "If DDT is paid, dividends become taxable in the hands of investors."
                ]
            }
        },
        interestIncome: {
            heading: "Interest Income (Especially in Hybrid/InvITs and Mortgage REITs)",
            items: [
                "Taxed as regular interest income in most jurisdictions.",
                "Subject to withholding tax for foreign investors."
            ]
        },
        capitalGains: {
            heading: "Capital Gains",
            general: "When investors sell REIT units for a profit, they may be taxed on capital gains.",
            shortLongTerm: {
                heading: "Short-term vs. Long-term Capital Gains:",
                items: [
                    "Short-term gains are taxed at regular income tax rates.",
                    "Long-term gains often have favorable tax rates (lower)."
                ]
            },
            indiaExample: {
                heading: "India Example:",
                items: [
                    "If REIT units are sold within 36 months → Short-term capital gains (STCG).",
                    "If held more than 36 months → Long-term capital gains (LTCG), taxed at 10% beyond ₹1 lakh of gains."
                ]
            }
        }
    };

    const withholdingTax = {
        title: "Withholding Tax (Primarily for Foreign Investors)",
        description: "Many countries deduct tax at source on dividends or interest paid to foreign investors. Withholding tax rates vary and can be reduced under Double Taxation Avoidance Agreements (DTAAs).",
        example: "Example: A U.S. REIT may withhold 30% of dividend income for a foreign investor unless a tax treaty applies (e.g., India-U.S. DTAA might reduce it to 15%)."
    };

    const taxReportingInvestors = {
        title: "Tax Reporting for Investors",
        items: [
            "Report dividend/interest income in annual tax returns.",
            "Track cost basis for calculating capital gains.",
            "Apply for foreign tax credits if applicable (to avoid double taxation)."
        ]
    };

    const summaryTableGeneral = {
        title: "Summary Table (General)",
        headers: ["Aspect", "REIT Level", "Investor Level"],
        rows: [
            ["Corporate Income Tax", "Exempt if 90%+ income distributed", "N/A"],
            ["Dividend Income", "Not taxed at REIT level", "Taxed as ordinary income (may vary)"],
            ["Interest Income", "Not taxed at REIT level", "Taxed as ordinary income"],
            ["Capital Gains (on units)", "N/A", "Taxed as STCG or LTCG"],
            ["Withholding Tax", "Not applicable", "Applied on foreign investor income"]
        ]
    };

    const specialNoteIndia = {
        title: "Special Note on REIT Taxation in India (2024+)",
        incomeStreams: [
            "Rental income: Taxed in hands of investors.",
            "Interest income: Taxed in hands of investors.",
            "Dividends: Exempt if REIT doesn't pay DDT."
        ],
        passThrough: "REIT itself is not taxed, acts as pass-through.",
        tds: "Tax withheld at source (TDS) on income paid to investors."
    };

    const indianREITTaxationFY2024_25 = {
        title: "REIT Taxation in India (as of FY 2024-25)",
        structure: {
            heading: "Structure of Indian REITs",
            description: "REITs in India are regulated by SEBI and typically invest in commercial real estate (like offices, malls, warehouses). A REIT acts as a pass-through entity, meaning most of the income is not taxed at the REIT level but instead in the hands of the investors."
        },
        taxationREITLevel: {
            heading: "Taxation at the REIT Level",
            subheading: "REIT is a Tax Pass-through Entity",
            description: "The REIT itself is not subject to corporate tax on the following income streams:",
            incomeStreams: [
                "Interest income received from Special Purpose Vehicles (SPVs)",
                "Dividends received from SPVs",
                "Rental income from owned properties"
            ],
            note: "Instead, this income is passed on to investors, and tax is levied at the investor level."
        },
        taxationInvestors: {
            heading: "Taxation in the Hands of Investors",
            introduction: "Indian REITs distribute income in three forms:",
            table: {
                headers: ["Component", "Taxability", "TDS Applicability", "Notes"],
                rows: [
                    ["Interest", "Taxable", "Yes (10% for resident; 5%-40% for non-residents)", "Taxed as \"Income from Other Sources\""],
                    ["Dividends", "May be tax-exempt or taxable depending on SPV’s DDT status", "Yes if taxable", "Exempt if DDT is not paid by SPV"],
                    ["Rental Income", "Taxable", "Yes (10% for residents; 5%-40% for non-residents)", "Taxed as \"Income from House Property\""],
                    ["Capital Gains", "Taxable", "Yes on sale of REIT units", "Depends on holding period"]
                ]
            },
            interestIncome: {
                heading: "Interest Income",
                items: [
                    "Fully taxable in the hands of the investor as ordinary income.",
                    "TDS applies:",
                    "10% for resident investors",
                    "5% or higher for non-residents (subject to DTAA relief)"
                ]
            },
            dividendIncome: {
                heading: "Dividend Income",
                items: [
                    "Exempt for investors if the SPV distributing the dividend has not opted to pay DDT (Dividend Distribution Tax).",
                    "Taxable if the SPV pays DDT — in this case, taxed in the investor's hands at applicable slab rates.",
                    "Most REITs structure payouts to ensure dividends remain tax-free for investors."
                ]
            },
            rentalIncome: {
                heading: "Rental Income",
                items: [
                    "Taxable in the hands of investors as “Income from House Property”",
                    "Eligible for:",
                    "Standard deduction of 30%",
                    "Interest deduction on borrowed capital (if any)"
                ]
            },
            capitalGains: {
                heading: "Capital Gains on Sale of REIT Units",
                table: {
                    headers: ["Holding Period", "Tax Type", "Tax Rate (Residents)"],
                    rows: [
                        ["≤ 36 months", "STCG", "15%"],
                        ["> 36 months", "LTCG", "10% (on gains > ₹1 lakh, no indexation)"]
                    ]
                },
                notes: [
                    "REIT units are listed on stock exchanges → capital gains taxed like equity.",
                    "Securities Transaction Tax (STT) applies."
                ]
            }
        }
    };

    const taxationNonResidentInvestors = {
        title: "Taxation for Non-Resident Investors",
        table: {
            headers: ["Component", "TDS Rate", "Notes"],
            rows: [
                ["Interest", "5% (under section 194LD)", "May be lower under DTAA"],
                ["Dividends", "20% (if taxable)", "Reduced under DTAA if applicable"],
                ["Rent", "30%", "DTAA may apply"],
                ["Capital Gains", "STCG 15%, LTCG 10%", "Similar to residents if listed"]
            ]
        },
        dtaaBenefits: {
            heading: "Non-residents may claim DTAA benefits by providing:",
            items: [
                "Tax residency certificate (TRC)",
                "Form 10F",
                "PAN"
            ]
        }
    };

    const complianceReporting = {
        title: "Compliance & Reporting",
        investorMust: {
            heading: "Investors must:",
            items: [
                "Include REIT income in ITR under relevant heads:",
                "Interest: “Income from Other Sources”",
                "Rent: “Income from House Property”",
                "Dividends: Exempt or “Other Sources”",
                "Capital gains: “Capital Gains”",
                "File ITR to claim refund of excess TDS if eligible",
                "Track holding period for REIT units carefully"
            ]
        }
    };

    const summaryInvestorTaxImpactIndia = {
        title: "Summary: Investor Tax Impact from Indian REITs",
        table: {
            headers: ["Income Type", "Resident Taxpayer", "Non-Resident Taxpayer"],
            rows: [
                ["Interest", "Taxable, 10% TDS", "Taxable, 5% TDS (DTAA may reduce)"],
                ["Dividends", "Usually Exempt", "Taxable @ 20% (or lower via DTAA)"],
                ["Rental Income", "Taxable, 10% TDS", "Taxable, 30% TDS"],
                ["Capital Gains", "15% STCG, 10% LTCG", "Same, with DTAA applicability"]
            ]
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    Taxation in REITs
                </h1>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                    Understanding the tax implications for Real Estate Investment Trusts (REITs) at both the entity and investor levels is crucial. This document outlines the general tax structure and specific considerations, particularly for Indian REITs.
                </p>

                {/* Tax Structure at the REIT Level Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">1.</span> {taxStructureREITLevel.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                        <span className="text-green-500 text-2xl mr-2">🟢</span> {taxStructureREITLevel.passThroughConcept.heading}
                    </h3>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                        {taxStructureREITLevel.passThroughConcept.description}
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                        <span className="text-green-500 text-2xl mr-2">✅</span> {taxStructureREITLevel.eligibilityConditions.heading}
                    </h3>
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {taxStructureREITLevel.eligibilityConditions.items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-base text-gray-700 mt-6 leading-relaxed flex items-start">
                        <span className="text-red-500 text-2xl mr-2">🛑</span> {taxStructureREITLevel.eligibilityConditions.failureConsequence}
                    </p>
                </section>

                {/* Taxation at the Investor Level Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">2.</span> {taxationInvestorLevel.title}
                    </h2>
                    <p className="text-base text-gray-700 mb-6 leading-relaxed">
                        {taxationInvestorLevel.introduction}
                    </p>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                        <span className="text-blue-500 text-2xl mr-2">📦</span> Types of Income from REITs:
                    </h3>
                    <ul className="list-none text-gray-700 space-y-2 ml-4 mb-8">
                        {taxationInvestorLevel.typesOfIncome.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Dividend Income */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">💸</span> {taxationInvestorLevel.dividendIncome.heading}
                        </h3>
                        <p className="text-base text-gray-700 mb-4 leading-relaxed">
                            {taxationInvestorLevel.dividendIncome.general}
                        </p>
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-gray-500 text-xl mr-2">▪️</span> {taxationInvestorLevel.dividendIncome.usExample.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {taxationInvestorLevel.dividendIncome.usExample.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-gray-500 text-xl mr-2">▪️</span> {taxationInvestorLevel.dividendIncome.indiaExample.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4">
                            {taxationInvestorLevel.dividendIncome.indiaExample.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Interest Income */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">🧾</span> {taxationInvestorLevel.interestIncome.heading}
                        </h3>
                        <ul className="list-none text-gray-700 space-y-2 ml-4">
                            {taxationInvestorLevel.interestIncome.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Capital Gains */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">💰</span> {taxationInvestorLevel.capitalGains.heading}
                        </h3>
                        <p className="text-base text-gray-700 mb-4 leading-relaxed">
                            {taxationInvestorLevel.capitalGains.general}
                        </p>
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-gray-500 text-xl mr-2">▪️</span> {taxationInvestorLevel.capitalGains.shortLongTerm.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {taxationInvestorLevel.capitalGains.shortLongTerm.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-gray-500 text-xl mr-2">▪️</span> {taxationInvestorLevel.capitalGains.indiaExample.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4">
                            {taxationInvestorLevel.capitalGains.indiaExample.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Withholding Tax Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">3.</span> {withholdingTax.title}
                    </h2>
                    <p className="text-base text-gray-700 mb-4 leading-relaxed">
                        {withholdingTax.description}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed">
                        {withholdingTax.example}
                    </p>
                </section>

                {/* Tax Reporting for Investors Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">4.</span> {taxReportingInvestors.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {taxReportingInvestors.items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Summary Table (General) Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📌</span> {summaryTableGeneral.title}
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {summaryTableGeneral.headers.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {summaryTableGeneral.rows.map((row, rowIndex) => (
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

                {/* Special Note on REIT Taxation in India Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🇮🇳</span> {specialNoteIndia.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {specialNoteIndia.incomeStreams.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                        <li className="flex items-start mt-4">
                            <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                            <span><strong className="font-medium">Pass-Through:</strong> {specialNoteIndia.passThrough}</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                            <span><strong className="font-medium">TDS:</strong> {specialNoteIndia.tds}</span>
                        </li>
                    </ul>
                </section>

                {/* REIT Taxation in India (as of FY 2024-25) Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🇮🇳</span> {indianREITTaxationFY2024_25.title}
                    </h2>

                    {/* Structure of Indian REITs */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">👷‍♂️</span> {indianREITTaxationFY2024_25.structure.heading}
                        </h3>
                        <p className="text-base text-gray-700 leading-relaxed">
                            {indianREITTaxationFY2024_25.structure.description}
                        </p>
                    </div>

                    {/* Taxation at the REIT Level */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-8">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">🏢</span> {indianREITTaxationFY2024_25.taxationREITLevel.heading}
                        </h3>
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-green-500 text-xl mr-2">✅</span> {indianREITTaxationFY2024_25.taxationREITLevel.subheading}
                        </h4>
                        <p className="text-base text-gray-700 mb-4 leading-relaxed">
                            {indianREITTaxationFY2024_25.taxationREITLevel.description}
                        </p>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {indianREITTaxationFY2024_25.taxationREITLevel.incomeStreams.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-base text-gray-700 leading-relaxed">
                            <span className="text-blue-500 text-lg mr-2 mt-0.5 inline-block">👉</span> {indianREITTaxationFY2024_25.taxationREITLevel.note}
                        </p>
                    </div>

                    {/* Taxation in the Hands of Investors */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                        <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                            <span className="text-red-500 text-2xl mr-2">👤</span> {indianREITTaxationFY2024_25.taxationInvestors.heading}
                        </h3>
                        <p className="text-base text-gray-700 mb-4 leading-relaxed">
                            {indianREITTaxationFY2024_25.taxationInvestors.introduction}
                        </p>
                        <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200 mb-8">
                            <table className="min-w-full divide-y divide-blue-200">
                                <thead className="bg-blue-100">
                                    <tr>
                                        {indianREITTaxationFY2024_25.taxationInvestors.table.headers.map((header, index) => (
                                            <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-blue-100">
                                    {indianREITTaxationFY2024_25.taxationInvestors.table.rows.map((row, rowIndex) => (
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

                        {/* Sub-sections of Taxation in the Hands of Investors */}
                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-blue-500 text-xl mr-2">📦</span> {indianREITTaxationFY2024_25.taxationInvestors.interestIncome.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {indianREITTaxationFY2024_25.taxationInvestors.interestIncome.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-blue-500 text-xl mr-2">💸</span> {indianREITTaxationFY2024_25.taxationInvestors.dividendIncome.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {indianREITTaxationFY2024_25.taxationInvestors.dividendIncome.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-blue-500 text-xl mr-2">🏢</span> {indianREITTaxationFY2024_25.taxationInvestors.rentalIncome.heading}
                        </h4>
                        <ul className="list-none text-gray-700 space-y-2 ml-4 mb-4">
                            {indianREITTaxationFY2024_25.taxationInvestors.rentalIncome.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-blue-600 mb-2 flex items-center">
                            <span className="text-blue-500 text-xl mr-2">💰</span> {indianREITTaxationFY2024_25.taxationInvestors.capitalGains.heading}
                        </h4>
                        <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200 mb-4">
                            <table className="min-w-full divide-y divide-blue-200">
                                <thead className="bg-blue-100">
                                    <tr>
                                        {indianREITTaxationFY2024_25.taxationInvestors.capitalGains.table.headers.map((header, index) => (
                                            <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-blue-100">
                                    {indianREITTaxationFY2024_25.taxationInvestors.capitalGains.table.rows.map((row, rowIndex) => (
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
                        <ul className="list-none text-gray-700 space-y-2 ml-4">
                            {indianREITTaxationFY2024_25.taxationInvestors.capitalGains.notes.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Taxation for Non-Resident Investors Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🌍</span> {taxationNonResidentInvestors.title}
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200 mb-8">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {taxationNonResidentInvestors.table.headers.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {taxationNonResidentInvestors.table.rows.map((row, rowIndex) => (
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
                        <span className="text-blue-500 text-2xl mr-2">✳️</span> {taxationNonResidentInvestors.dtaaBenefits.heading}
                    </h3>
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {taxationNonResidentInvestors.dtaaBenefits.items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Compliance & Reporting Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📄</span> {complianceReporting.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                        <span className="text-blue-500 text-2xl mr-2">✅</span> {complianceReporting.investorMust.heading}
                    </h3>
                    <ul className="list-none text-gray-700 space-y-2 ml-4">
                        {complianceReporting.investorMust.items.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Summary: Investor Tax Impact from Indian REITs Section */}
                <section className="p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">✅</span> {summaryInvestorTaxImpactIndia.title}
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {summaryInvestorTaxImpactIndia.table.headers.map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {summaryInvestorTaxImpactIndia.table.rows.map((row, rowIndex) => (
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

            </div>
        </div>
    );
};

export default REITTaxation;
