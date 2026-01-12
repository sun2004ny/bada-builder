import React from 'react';

const TypesOfREITs = () => {
    // Data extracted from the Word document: Types of REITs.docx

    const reitTypes = [
        {
            name: "Equity REITs",
            description: "own and operate real estate (rent-focused)"
        },
        {
            name: "Mortgage REITs",
            description: "provide loans and earn interest"
        },
        {
            name: "Hybrid REITs",
            description: "combine both equity and mortgage strategies"
        },
        {
            name: "Private REITs",
            description: "unlisted, less regulated"
        },
        {
            name: "Public Non-Traded REITs",
            description: "regulated, but not on stock exchange"
        }
    ];

    const indiaSpecific = {
        governance: "In India, SEBI governs REITs.",
        popularExamples: "Popular examples: Embassy REIT, Mindspace REIT, Brookfield India REIT."
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    Types of REITs
                </h1>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-2xl mx-auto">
                    Real Estate Investment Trusts (REITs) come in various forms, each with distinct investment strategies and regulatory characteristics.
                </p>

                {/* Types of REITs Section */}
                <section className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">📋</span> Categories of REITs
                    </h2>
                    <ul className="list-none text-gray-700 space-y-4 ml-4">
                        {reitTypes.map((type, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                <span> {/* Removed flex-1 */}
                                    <strong className="font-semibold text-gray-900">{type.name}</strong> – {type.description}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* India Specific Section */}
                <section className="p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">📍</span> India Specific
                    </h2>
                    <p className="text-base text-gray-700 mb-2 leading-relaxed flex items-start ml-4"> {/* Added ml-4 */}
                        <span className="text-green-600 text-lg mr-2 mt-0.5">▪</span>
                        <span>{indiaSpecific.governance}</span> {/* Removed flex-1 */}
                    </p>
                    <p className="text-base text-gray-700 leading-relaxed flex items-start ml-4"> {/* Added ml-4 */}
                        <span className="text-green-600 text-lg mr-2 mt-0.5">▪</span>
                        <span>{indiaSpecific.popularExamples}</span> {/* Removed flex-1 */}
                    </p>
                </section>

            </div>
        </div>
    );
};

export default TypesOfREITs;
