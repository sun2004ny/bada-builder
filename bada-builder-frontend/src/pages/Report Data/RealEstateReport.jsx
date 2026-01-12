import React from 'react';

const RealEstateReport = () => {
    // Data extracted from the Word document: Real Estate Market Research.docx

    const marketOverview = {
        title: "Market Overview",
        drivers: [
            "Strong IT and tech industry (Infosys, Wipro, TCS, Accenture, etc.)",
            "Growing presence of global capability centers (GCCs)",
            "Expanding metro network (Phase 2 nearing completion)",
            "Favorable climate and cosmopolitan appeal"
        ],
        growthCorridors: [
            { name: "North Bangalore", description: "Airport-driven growth (Devanahalli, Hebbal)" },
            { name: "East Bangalore", description: "Tech corridor (Whitefield, KR Puram)" },
            { name: "South Bangalore", description: "Established residential zones (JP Nagar, Jayanagar)" },
            { name: "West Bangalore", description: "Industrial + affordable (Kengeri, Mysore Road)" }
        ]
    };

    const residentialMarket = {
        title: "Residential Market Analysis",
        demandTrends: [
            "High demand in 2BHK and 3BHK apartments",
            "Steady interest from NRIs and IT professionals",
            "Shift toward gated communities and townships"
        ],
        popularMicroMarkets: [
            { area: "Whitefield", price: "₹7,200", trend: "↑ 7.5%", yield: "~4.2%" },
            { area: "Sarjapur Road", price: "₹7,800", trend: "↑ 8.1%", yield: "~4.0%" },
            { area: "Hebbal", price: "₹9,000", trend: "↑ 9.3%", yield: "~4.5%" },
            { area: "Devanahalli", price: "₹6,200", trend: "↑ 10.2%", yield: "~3.8%" },
            { area: "Electronic City", price: "₹5,800", trend: "↑ 6.4%", yield: "~4.8%" }
        ],
        supplyIndicators: [
            "Major developers: Prestige, Sobha, Brigade, Puravankara, Godrej",
            "Most launches are mid-segment (₹60L–₹1.2Cr) properties",
            "Inventory overhang: ~12 months (down from 18 months in 2022)"
        ]
    };

    const commercialRealEstate = {
        title: "Commercial Real Estate Overview",
        itOfficeSpace: [
            "Vacancy rates ~12% in Q1 2025 (down from 15% in 2023)",
            "Grade A office space in demand across Outer Ring Road, Whitefield, and North Bangalore"
        ],
        coWorking: [
            "Rapid growth led by WeWork, Awfis, Smartworks",
            "Startups and SMEs driving demand"
        ],
        commercialHubs: [
            "Outer Ring Road, Whitefield, Manyata Tech Park, Bellandur",
            "North Bangalore catching up due to proximity to KIAL and upcoming aerospace SEZ"
        ]
    };

    const pricingInvestmentTrends = {
        title: "Pricing & Investment Trends",
        priceGrowth: [
            "Residential CAGR (2020–2025): ~7–9%",
            "Commercial rental growth: 5–6% annually in prime zones"
        ],
        roiPotential: [
            "Rental yields between 3.8% to 5%",
            "Strong resale potential in East and North zones",
            "Affordable housing zones (Kengeri, Hoskote) offer higher appreciation"
        ]
    };

    const infrastructureConnectivity = {
        title: "Infrastructure & Connectivity",
        points: [
            "Namma Metro Phase 2: Will significantly reduce commute times",
            "Peripheral Ring Road: To decongest Outer Ring Road",
            "Satellite Town Ring Road (STRR) and Suburban Rail Project underway",
            "Proximity to Kempegowda International Airport enhances value in North Bangalore"
        ]
    };

    const regulatoryEnvironment = {
        title: "Regulatory Environment",
        points: [
            "RERA Karnataka is active and transparent: https://rera.karnataka.gov.in",
            "Digitized land records via Bhoomi",
            "Stamp duty: 5–6% (varies by property value)",
            "FSI (Floor Space Index) regulated under Revised Master Plan 2031",
            "BBMP building plan approval delays have reduced due to digitization"
        ]
    };

    const buyerDemographics = {
        title: "Buyer Demographics",
        points: [
            "70% End-users (IT workforce, business professionals, families)",
            "30% Investors (local + NRI)",
            "Increasing demand for senior living, co-living, and green-certified homes"
        ]
    };

    const risksChallenges = {
        title: "Risks & Challenges",
        points: [
            "Water scarcity risk in peripheral areas",
            "Traffic congestion in ORR and IT zones",
            "Slow legal enforcement in property disputes",
            "Overdependence on IT sector for market stability"
        ]
    };

    const futureOutlook = {
        title: "Future Outlook (2025–2030)",
        points: [
            "10–12% CAGR expected in North & East Bangalore",
            "Smart City Projects, IT SEZs, and data centers to drive demand",
            "Real estate digitization and fractional ownership platforms gaining traction",
            "REIT opportunities increasing, especially in commercial zones"
        ]
    };

    const recommendations = {
        title: "Recommendations",
        forInvestors: [
            "Focus on North Bangalore (Devanahalli, Hebbal) for long-term capital appreciation",
            "Explore rental income in Whitefield, Electronic City, and Sarjapur"
        ],
        forDevelopers: [
            "Mid-segment and premium townships are in demand",
            "Senior housing and smart, sustainable communities are growth niches"
        ],
        forReitsCrowdfunding: [
            "Partner with commercial developers in ORR and North Bangalore",
            "Residential REITs can focus on premium gated communities in East Bangalore"
        ]
    };

    const toolsResources = {
        title: "Tools & Resources",
        data: [
            { tool: "RERA Websites", use: "Verify legal compliance" },
            { tool: "MagicBricks / 99acres", use: "Price trends, listings" },
            { tool: "Knight Frank / JLL Reports", use: "Market trends & forecasts" },
            { tool: "Google Trends / Surveys", use: "Understand buyer interest" },
            { tool: "GIS/Map APIs", use: "Analyze location accessibility" },
            { tool: "CMIE / RBI data", use: "Macroeconomic indicators" }
        ]
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    Real Estate Market Research Report: Bangalore, India (2025)
                </h1>

                {/* Executive Summary */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">📌</span> Executive Summary
                    </h2>
                    <p className="text-base text-gray-700 leading-relaxed">
                        Bangalore, known as the "Silicon Valley of India," continues to attract investments due to its robust IT/ITeS sector, strong rental demand, and infrastructural development. In 2025, the city’s real estate market is being driven by end-user demand, a growing startup ecosystem, and proactive governance. Residential and commercial segments both show healthy growth, especially in suburban and peripheral zones.
                    </p>
                </section>

                {/* Market Overview Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🧭</span> {marketOverview.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Key Drivers:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {marketOverview.drivers.map((driver, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{driver}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Growth Corridors:</h3>
                    <ul className="list-none text-gray-700 space-y-2">
                        {marketOverview.growthCorridors.map((corridor, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">
                                    <strong className="font-medium">{corridor.name}</strong> – {corridor.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Residential Market Analysis Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-blue-600 text-4xl mr-4">🏡</span> {residentialMarket.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Demand Trends:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {residentialMarket.demandTrends.map((trend, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{trend}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Popular Micro-Markets:</h3>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200 mb-6">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {["Area", "Avg Price (INR/sq.ft.)", "Price Trend (YoY)", "Rental Yield"].map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {residentialMarket.popularMicroMarkets.map((market, index) => (
                                    <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{market.area}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{market.price}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${market.trend.includes('↑') ? 'text-green-600' : 'text-gray-700'}`}>{market.trend}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{market.yield}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Supply Indicators:</h3>
                    <ul className="list-none text-gray-700 space-y-2">
                        {residentialMarket.supplyIndicators.map((indicator, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{indicator}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Commercial Real Estate Overview Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🏢</span> {commercialRealEstate.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">IT/Office Space:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {commercialRealEstate.itOfficeSpace.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Co-working:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {commercialRealEstate.coWorking.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Commercial Hubs:</h3>
                    <ul className="list-none text-gray-700 space-y-2">
                        {commercialRealEstate.commercialHubs.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Pricing & Investment Trends Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">💰</span> {pricingInvestmentTrends.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Price Growth:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {pricingInvestmentTrends.priceGrowth.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">ROI Potential:</h3>
                    <ul className="list-none text-gray-700 space-y-2">
                        {pricingInvestmentTrends.roiPotential.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Infrastructure & Connectivity Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🛣️</span> {infrastructureConnectivity.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2">
                        {infrastructureConnectivity.points.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Regulatory Environment Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">⚖️</span> {regulatoryEnvironment.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2">
                        {regulatoryEnvironment.points.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Buyer Demographics Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">👥</span> {buyerDemographics.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2">
                        {buyerDemographics.points.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Risks & Challenges Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📈</span> {risksChallenges.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2">
                        {risksChallenges.points.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Future Outlook Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🔮</span> {futureOutlook.title}
                    </h2>
                    <ul className="list-none text-gray-700 space-y-2">
                        {futureOutlook.points.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recommendations Section */}
                <section className="mb-12 p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">✅</span> {recommendations.title}
                    </h2>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">For Investors:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {recommendations.forInvestors.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">For Developers:</h3>
                    <ul className="list-none text-gray-700 space-y-2 mb-6">
                        {recommendations.forDevelopers.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">For REITs or Crowdfunding Platforms:</h3>
                    <ul className="list-none text-gray-700 space-y-2">
                        {recommendations.forReitsCrowdfunding.map((item, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span className="flex-1">{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Tools & Resources Section */}
                <section className="p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">🛠️</span> {toolsResources.title}
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {["Tool/Resource", "Use"].map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {toolsResources.data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                        <td className="px-4 py-3 whitespace-normal text-sm font-semibold text-gray-900">{row.tool}</td>
                                        <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">{row.use}</td>
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

export default RealEstateReport;