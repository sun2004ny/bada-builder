import React from 'react';

const REITJobProfiles = () => {
    // Data extracted from the Word document: JOB PROFILES IN REIT.docx

    const jobCategories = [
        {
            title: "Investment & Acquisition",
            jobs: [
                { title: "Investment Analyst", entry: "₹6–10 LPA", mid: "₹12–20 LPA", senior: "₹25–40 LPA" },
                { title: "Acquisitions Manager", entry: "–", mid: "₹18–28 LPA", senior: "₹35–60 LPA" },
                { title: "Due Diligence Specialist", entry: "₹5–8 LPA", mid: "₹10–18 LPA", senior: "₹20–30 LPA" },
            ]
        },
        {
            title: "Asset Management",
            jobs: [
                { title: "Asset Manager", entry: "₹7–12 LPA", mid: "₹15–25 LPA", senior: "₹30–50 LPA" },
                { title: "Portfolio Manager", entry: "–", mid: "₹20–30 LPA", senior: "₹40–65 LPA" },
                { title: "Leasing Manager", entry: "₹6–10 LPA", mid: "₹12–20 LPA", senior: "₹25–35 LPA" },
            ]
        },
        {
            title: "Property & Facilities Management",
            jobs: [
                { title: "Property Manager", entry: "₹4–7 LPA", mid: "₹8–14 LPA", senior: "₹18–25 LPA" },
                { title: "Facilities Manager", entry: "₹4–8 LPA", mid: "₹10–16 LPA", senior: "₹20–28 LPA" },
            ]
        },
        {
            title: "Development & Construction",
            jobs: [
                { title: "Development Manager", entry: "–", mid: "₹15–22 LPA", senior: "₹30–45 LPA" },
                { title: "Construction Project Manager", entry: "₹6–10 LPA", mid: "₹12–20 LPA", senior: "₹25–35 LPA" },
            ]
        },
        {
            title: "Finance & Accounting",
            jobs: [
                { title: "Financial Analyst", entry: "₹6–9 LPA", mid: "₹10–18 LPA", senior: "₹20–28 LPA" },
                { title: "REIT Tax Accountant", entry: "₹5–8 LPA", mid: "₹9–16 LPA", senior: "₹18–25 LPA" },
                { title: "Controller / CFO", entry: "–", mid: "₹35–50 LPA", senior: "₹60 LPA–₹1 Cr+" },
            ]
        },
        {
            title: "Legal & Compliance",
            jobs: [
                { title: "Legal Counsel", entry: "₹6–10 LPA", mid: "₹15–25 LPA", senior: "₹30–50 LPA" },
                { title: "Compliance Officer", entry: "₹5–9 LPA", mid: "₹12–20 LPA", senior: "₹25–35 LPA" },
            ]
        },
        {
            title: "Capital Markets & Investor Relations",
            jobs: [
                { title: "Investor Relations Analyst", entry: "₹6–10 LPA", mid: "₹12–22 LPA", senior: "₹30–45 LPA" },
                { title: "Capital Markets Manager", entry: "–", mid: "₹18–28 LPA", senior: "₹35–55 LPA" },
            ]
        },
        {
            title: "Research & Strategy",
            jobs: [
                { title: "Market Research Analyst", entry: "₹4–8 LPA", mid: "₹10–15 LPA", senior: "₹18–25 LPA" },
                { title: "Strategic Planner", entry: "–", mid: "₹15–25 LPA", senior: "₹30–40 LPA" },
            ]
        },
        {
            title: "Technology & Data Analytics",
            jobs: [
                { title: "Data Analyst – Real Estate", entry: "₹5–9 LPA", mid: "₹10–18 LPA", senior: "₹22–30 LPA" },
                { title: "IT / PropTech Manager", entry: "–", mid: "₹12–20 LPA", senior: "₹25–40 LPA" },
            ]
        },
        {
            title: "Marketing & Sales",
            jobs: [
                { title: "Sales Executive / Broker Liaison", entry: "₹3–6 LPA", mid: "₹7–12 LPA", senior: "₹15–22 LPA" },
                { title: "Marketing Manager (REIT)", entry: "₹6–10 LPA", mid: "₹12–18 LPA", senior: "₹22–30 LPA" },
            ]
        },
    ];

    const internshipsEntryPoints = {
        title: "Internships / Freshers / Entry Points",
        roles: [
            { role: "Analyst Intern / Graduate Analyst", salary: "₹20,000–₹40,000/month" },
            { role: "Junior Analyst – Acquisitions / Asset Management", salary: "₹4–7 LPA" },
            { role: "Operations / Leasing Coordinator", salary: "₹3.5–6 LPA" },
        ]
    };

    const note = "These are general estimates based on industry data from REITs like Embassy Office Parks REIT, Mindspace Business Parks REIT, Brookfield India REIT, and other property funds. Salaries in private equity-backed or multinational REITs may be higher.";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    JOB PROFILES IN REIT’S
                </h1>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                    Here’s a detailed overview of REIT job profiles in India along with approximate salary ranges (per annum in INR). Salaries vary depending on experience, company size, location (e.g., Mumbai, Bangalore, Delhi), and whether it's a listed REIT (like Embassy REIT) or a private investment firm.
                </p>

                {/* Job Categories Section */}
                {jobCategories.map((category, catIndex) => (
                    <section key={catIndex} className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                            <span className="text-green-600 text-4xl mr-4">🔷</span> {category.title}
                        </h2>
                        <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                            <table className="min-w-full divide-y divide-blue-200">
                                <thead className="bg-blue-100">
                                    <tr>
                                        {["Job Title", "Entry-Level (0–2 yrs)", "Mid-Level (3–7 yrs)", "Senior (8+ yrs)"].map((header, index) => (
                                            <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-blue-100">
                                    {category.jobs.map((job, jobIndex) => (
                                        <tr key={jobIndex} className={`${jobIndex % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                            <td className="px-4 py-3 whitespace-normal text-sm font-semibold text-gray-900">{job.title}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{job.entry}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{job.mid}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{job.senior}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ))}

                {/* Internships / Freshers / Entry Points Section */}
                <section className="mb-12 p-6 bg-green-50 rounded-xl shadow-lg border-l-8 border-green-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-6 flex items-center">
                        <span className="text-purple-600 text-4xl mr-4">🔹</span> {internshipsEntryPoints.title}
                    </h2>
                    <div className="overflow-x-auto rounded-lg shadow-xl border border-blue-200">
                        <table className="min-w-full divide-y divide-blue-200">
                            <thead className="bg-blue-100">
                                <tr>
                                    {["Role", "Salary Range"].map((header, index) => (
                                        <th key={index} scope="col" className="px-4 py-3 text-left text-xs sm:text-sm font-bold text-blue-800 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-100">
                                {internshipsEntryPoints.roles.map((role, index) => (
                                    <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100 transition-colors duration-200`}>
                                        <td className="px-4 py-3 whitespace-normal text-sm font-semibold text-gray-900">{role.role}</td>
                                        <td className="px-4 py-3 whitespace-normal text-sm text-gray-700">{role.salary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Note Section */}
                <section className="p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                        <span className="text-green-600 text-4xl mr-4">💡</span> Note
                    </h2>
                    <p className="text-base text-gray-700 leading-relaxed">
                        {note}
                    </p>
                </section>

            </div>
        </div>
    );
};

export default REITJobProfiles;
