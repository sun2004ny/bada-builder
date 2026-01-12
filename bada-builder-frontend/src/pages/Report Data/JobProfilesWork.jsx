import React from 'react';

const JobProfilesWork = () => {
    // Data extracted from the Word document: WORK OF DIFFERENT JOB PROFILES.docx

    const jobProfilesData = [
        {
            id: "investment-analyst",
            title: "Investment Analyst",
            intro: "An Investment Analyst in a Real Estate Investment Trust (REIT) plays a crucial role in supporting investment decisions by conducting financial analysis, market research, and performance monitoring of real estate assets. Here’s a breakdown of their typical responsibilities:",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🔍",
                    items: [
                        "Financial Modeling & Valuation: Build and maintain detailed financial models (DCF, IRR, NPV) for property acquisitions, developments, and dispositions. Analyze projected income, expenses, financing structures, and return metrics. Perform scenario/sensitivity analysis to assess investment risk.",
                        "Market Research: Study real estate markets and submarkets for trends in rent, occupancy, cap rates, supply-demand dynamics, etc. Benchmark properties against market comparables (comps). Track macroeconomic and regulatory factors affecting real estate investments.",
                        "Due Diligence Support: Assist in evaluating new acquisition opportunities. Conduct property site visits, review legal/technical documents, leases, and tenant profiles. Coordinate with legal, technical, and property management teams.",
                        "Portfolio Performance Analysis: Monitor the performance of REIT-owned assets. Track leasing activity, occupancy, tenant retention, and NOI (Net Operating Income). Generate periodic reports for senior management and investors.",
                        "Reporting & Presentations: Prepare investment committee memos and presentation decks. Create dashboards and summaries for internal and external stakeholders. Assist with quarterly and annual reporting requirements.",
                        "Stakeholder Coordination: Collaborate with asset managers, acquisitions team, legal advisors, and external valuers. Support communication with institutional investors or fund managers if required."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Financial modeling and proficiency in Excel.",
                        "Understanding of real estate metrics (cap rate, IRR, NOI, etc.).",
                        "Knowledge of property types (residential, commercial, industrial, etc.).",
                        "Analytical mindset and attention to detail.",
                        "Familiarity with tools like Argus, CoStar, REIS, or Yardi (depending on region)."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Finance, Economics, Real Estate, or related field.",
                        "Professional certifications like CFA, CAIA, or RICS (advantageous but not always required)."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Analyst Intern / Graduate Analyst → Junior Analyst → Analyst → Senior Analyst → Specialist or Manager Roles"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy and timeliness of research and analysis support.",
                        "Quality of reports and presentations prepared.",
                        "Ability to learn and apply new concepts.",
                        "Feedback from mentors and team members."
                    ]
                }
            ]
        },
        {
            id: "acquisition-manager",
            title: "Acquisition Manager",
            intro: "An Acquisitions Manager in a Real Estate Investment Trust (REIT) is responsible for sourcing, evaluating, negotiating, and closing real estate investment opportunities. This is a strategic and high-impact role that directly affects the growth and profitability of the REIT’s portfolio.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Deal Sourcing: Identify and pursue potential acquisition opportunities across targeted real estate sectors (e.g., residential, commercial, retail, industrial). Build and maintain relationships with brokers, developers, property owners, and institutional partners. Attend property expos, networking events, and industry conferences.",
                        "Initial Screening & Feasibility: Conduct preliminary underwriting to assess deal viability. Evaluate alignment with the REIT’s investment criteria (yield expectations, location, property type, risk profile). Present high-level investment summaries to senior management.",
                        "Financial Analysis & Due Diligence: Oversee or collaborate with analysts to conduct detailed financial modeling (IRR, DCF, ROI, sensitivity analysis). Coordinate due diligence across legal, technical, environmental, and market disciplines. Review property leases, rent rolls, title documents, and regulatory compliance.",
                        "Deal Structuring & Negotiation: Structure acquisition terms, including pricing, financing, and legal considerations. Negotiate with sellers, brokers, lenders, and legal advisors. Draft and review term sheets, MOUs, and sale-purchase agreements (SPAs).",
                        "Investment Committee Presentation: Prepare comprehensive investment memos and pitch decks. Present findings and recommendations to the investment committee for approval. Incorporate feedback and revise deal terms as needed.",
                        "Transaction Execution: Oversee the execution of approved acquisitions, ensuring timely closings. Coordinate with finance and legal teams for funds transfer and documentation. Ensure post-acquisition integration with asset management and operations teams.",
                        "Market Intelligence & Strategy: Stay updated on real estate trends, capital markets, and competitor activity. Contribute to the REIT’s overall investment strategy and pipeline planning. Analyze portfolio gaps and suggest acquisition strategies accordingly."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong negotiation and deal-making ability.",
                        "Deep understanding of real estate valuation, financing structures, and legal frameworks.",
                        "Strong analytical skills and financial modeling capabilities.",
                        "Project management and cross-functional coordination.",
                        "Networking and relationship-building with real estate stakeholders."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "�",
                    items: [
                        "Bachelor's or Master’s degree in Real Estate, Finance, Business Administration, or related fields.",
                        "MBA or professional designations (CFA, MRICS, CCIM) are often advantageous."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Analyst / Associate → Senior Associate → Acquisitions Manager → Director / VP of Acquisitions → Head of Investments / CIO"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Number and value of acquisitions closed",
                        "Internal Rate of Return (IRR) and ROI on deals",
                        "Time to close",
                        "Alignment with REIT strategy (geographic or asset class coverage)"
                    ]
                }
            ]
        },
        {
            id: "due-diligence-specialist",
            title: "Due Diligence Specialist",
            intro: "A Due Diligence Specialist in a Real Estate Investment Trust (REIT) plays a critical role in assessing the risks, compliance, and overall integrity of real estate transactions before they are finalized. Their job ensures that all aspects of a potential acquisition or development are thoroughly vetted—financially, legally, technically, and operationally—so that the REIT makes informed, secure investment decisions.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧾",
                    items: [
                        "Due Diligence Planning & Coordination: Develop and manage a due diligence checklist tailored to each real estate asset class (e.g., residential, office, retail, industrial). Coordinate with internal teams (acquisitions, legal, finance, technical, ESG) and external consultants (lawyers, engineers, auditors). Set timelines and ensure all diligence tasks are completed within the acquisition window.",
                        "Legal & Regulatory Review: Review title deeds, encumbrance certificates, and ownership documents. Confirm land use zoning, building approvals, and environmental compliance. Ensure properties have valid permits and licenses (e.g., fire safety, occupancy certificates).",
                        "Financial & Tax Diligence: Validate rent rolls, lease agreements, and income statements. Cross-check operating expenses, property taxes, and service contracts. Analyze existing debt, liens, or unpaid obligations associated with the asset.",
                        "Technical & Physical Inspection: Engage civil engineers and architects to inspect building conditions. Assess structural integrity, HVAC, plumbing, and electrical systems. Flag issues related to maintenance, renovation needs, or code violations.",
                        "Environmental & ESG Compliance: Conduct environmental site assessments (ESA Phase I/II). Review sustainability metrics and ESG risks. Ensure compliance with local and national environmental laws.",
                        "Tenant & Lease Audit: Verify tenant profiles, lease terms, rent escalations, and renewal clauses. Review security deposits, rent arrears, and subletting terms. Assess tenant concentration risk and lease rollover schedules.",
                        "Risk Identification & Reporting: Summarize key findings and red flags in a due diligence report. Quantify potential deal risks (e.g., legal disputes, deferred maintenance, non-compliance). Recommend mitigations, deal restructuring, or walk-away strategies if required.",
                        "Documentation & Archiving: Maintain detailed records of all documents reviewed. Ensure documentation aligns with compliance and audit requirements. Support integration into the REIT’s asset management systems post-closing."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong understanding of real estate law, zoning, and regulatory frameworks.",
                        "Ability to read and interpret complex legal, financial, and technical documents.",
                        "Project management and coordination skills.",
                        "Attention to detail and strong risk assessment capabilities.",
                        "Familiarity with tools like Microsoft Excel, SharePoint, and legal/document management platforms."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Law, Real Estate, Finance, Civil Engineering, or related field.",
                        "Certifications such as RICS, CRE, LEED (for ESG), or legal bar membership (for legal DD specialists) are advantageous."
                    ]
                },
                {
                    heading: "Career Progression",
                    icon: "📈",
                    items: ["Analyst → Due Diligence Associate → Due Diligence Specialist → Senior Manager / VP of Compliance & Risk → Chief Risk Officer (CRO)"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Timely completion of due diligence phases",
                        "Number of risk issues identified and mitigated",
                        "Quality and accuracy of reports",
                        "Deal fallout rate due to undetected risks (should be minimal)"
                    ]
                }
            ]
        },
        {
            id: "asset-manager",
            title: "Asset Manager",
            intro: "An Asset Manager in a Real Estate Investment Trust (REIT) is responsible for maximizing the value, performance, and profitability of the REIT’s property portfolio. While acquisition teams focus on buying assets, asset managers focus on optimizing the performance of owned assets throughout the investment lifecycle—from stabilization to exit.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Portfolio Performance Management: Monitor and enhance the performance of properties in terms of occupancy, rental income, Net Operating Income (NOI), and capital appreciation. Set performance benchmarks and KPIs for each asset. Analyze and improve financial performance vs. budgeted projections.",
                        "Operational Oversight: Work closely with property managers to oversee day-to-day operations. Ensure efficient maintenance, tenant satisfaction, and compliance with service standards. Approve major repairs, upgrades, or vendor contracts.",
                        "Leasing & Tenant Management: Support or drive leasing strategies to maximize occupancy and rental rates. Negotiate lease renewals, extensions, and rent escalations. Manage tenant mix, especially in commercial or retail portfolios, to maintain property value.",
                        "Capital Expenditure (CapEx) Planning: Plan and monitor CapEx projects such as renovations, upgrades, or repositioning. Approve project budgets, timelines, and vendors. Ensure ROI on CapEx investments aligns with strategic goals.",
                        "Financial Reporting & Analysis: Track cash flows, operating expenses, and capital reserves. Generate monthly/quarterly performance reports for internal stakeholders or investors. Monitor loan covenants and ensure debt compliance (if assets are financed).",
                        "Strategic Planning & Value Creation: Develop and execute asset-specific business plans (e.g., repositioning, redevelopment, or disposition). Identify underperforming assets and propose corrective action (lease-up, sale, or redevelopment). Coordinate with investment teams for asset refinancing, recapitalization, or disposal.",
                        "Compliance & Risk Management: Ensure assets comply with zoning laws, environmental regulations, fire safety, and other legal norms. Work with legal and ESG teams to monitor risks and sustainability performance. Oversee insurance coverage and claims management."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Deep understanding of real estate operations, leasing, and property lifecycle.",
                        "Strong financial acumen (NOI, IRR, CapEx budgeting, etc.).",
                        "Leadership, negotiation, and vendor management skills.",
                        "Analytical and data-driven decision-making ability.",
                        "Familiarity with tools like Yardi, MRI, Argus, or custom dashboards."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Real Estate, Finance, Business Administration, or Engineering.",
                        "MBA, MRICS, or CCIM certifications are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Asset Management Analyst → Associate → Asset Manager → Senior Asset Manager → VP / Director of Asset Management → Chief Operating Officer (COO)"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "NOI growth YoY",
                        "Occupancy rate improvement",
                        "Lease renewal success rate",
                        "CapEx ROI",
                        "Portfolio valuation uplift"
                    ]
                }
            ]
        },
        {
            id: "portfolio-manager",
            title: "Portfolio Manager",
            intro: "A Portfolio Manager in a Real Estate Investment Trust (REIT) oversees the performance and strategic direction of the REIT’s entire real estate portfolio (or a specific segment of it), ensuring it aligns with the firm’s financial, risk, and diversification goals. This role sits above individual asset management and focuses on portfolio-wide optimization, capital allocation, and long-term value creation.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Portfolio Strategy & Planning: Define and execute the REIT’s portfolio strategy, including asset allocation by geography, property type, and risk profile. Develop short- and long-term plans for acquisitions, dispositions, and asset repositioning. Monitor market trends to realign the portfolio with changing conditions or investor expectations.",
                        "Performance Monitoring & Optimization: Monitor portfolio-level KPIs like IRR, total return, occupancy, NOI, leverage ratios, and yield. Assess underperforming assets and recommend value enhancement, divestment, or restructuring. Optimize asset mix to balance income stability and capital appreciation.",
                        "Capital Allocation: Allocate capital across assets and projects based on expected returns and risk exposure. Support funding decisions for development, renovation, or leasing initiatives. Coordinate with the finance team on debt structuring, refinancing, and capital deployment.",
                        "Risk Management: Identify and monitor systemic and asset-level risks (e.g., tenant concentration, geographic exposure). Ensure compliance with internal policies, regulatory frameworks, and REIT guidelines. Develop contingency plans for economic downturns or sector-specific shocks.",
                        "Investor Relations & Reporting: Present portfolio updates to investors, boards, or investment committees. Prepare quarterly/annual portfolio reviews with insights into performance, risks, and strategy. Support fundraising efforts by showcasing portfolio strength and growth potential.",
                        "Cross-Team Coordination: Collaborate with acquisitions, asset management, legal, finance, and ESG teams. Ensure consistency between asset-level execution and portfolio-wide strategy. Align individual asset plans with broader portfolio goals."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong strategic thinking and investment analysis.",
                        "Deep understanding of real estate markets, asset classes, and financial metrics.",
                        "Excellent communication and stakeholder management.",
                        "Experience with portfolio analytics tools, dashboards, and scenario modeling.",
                        "Ability to interpret and manage large sets of performance data across diverse assets."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Finance, Economics, Real Estate, or related field.",
                        "MBA, CFA, CAIA, or RICS credentials are highly valued."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Analyst / Associate → Asset Manager → Portfolio Manager → Head of Portfolio Management → Chief Investment Officer (CIO)"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Portfolio IRR and total return",
                        "Occupancy and rent growth across the portfolio",
                        "Risk-adjusted return (Sharpe ratio or similar)",
                        "Diversification level (by location, sector, tenant)",
                        "Value created through strategic asset decisions"
                    ]
                }
            ]
        },
        {
            id: "leasing-manager",
            title: "Leasing Manager",
            intro: "A Leasing Manager in a Real Estate Investment Trust (REIT) is responsible for managing all activities related to leasing of the REIT’s properties. Their primary goal is to maximize occupancy, optimize rental income, and ensure tenant satisfaction to enhance the asset’s value.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Lease Management & Negotiation: Oversee leasing transactions, including new leases, renewals, and extensions. Negotiate lease terms, rental rates, and incentives with prospective and existing tenants. Draft, review, and coordinate lease agreements with legal and compliance teams.",
                        "Tenant Acquisition & Retention: Develop and implement tenant acquisition strategies to maintain or increase occupancy rates. Build and maintain strong tenant relationships to encourage lease renewals. Handle tenant queries, complaints, and requests promptly to improve satisfaction.",
                        "Market Analysis & Rent Pricing: Analyze market rent trends, competitor offerings, and demand-supply dynamics. Recommend competitive rental rates and leasing strategies based on market data. Monitor and report on leasing activity and market conditions.",
                        "Marketing & Promotion: Collaborate with marketing teams or brokers to promote available spaces. Organize property tours, open houses, and leasing events. Create marketing materials and online listings.",
                        "Lease Administration & Reporting: Maintain lease documentation and databases. Track lease expirations, rent escalations, and tenant obligations. Prepare leasing performance reports and forecasts for management.",
                        "Collaboration with Stakeholders: Work closely with property managers, asset managers, and legal teams. Coordinate with external brokers and leasing agents as needed. Support asset managers in executing leasing-related business plans."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong negotiation and communication skills.",
                        "Good understanding of lease structures, real estate law, and market dynamics.",
                        "Customer service orientation and relationship management.",
                        "Analytical skills to evaluate market data and leasing performance.",
                        "Proficiency in leasing management software and CRM tools."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Real Estate, Business Administration, Marketing, or related field.",
                        "Certifications such as Certified Commercial Investment Member (CCIM) or similar are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Leasing Coordinator/Assistant → Leasing Manager → Senior Leasing Manager → Director of Leasing → VP of Leasing or Asset Management"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Occupancy rate",
                        "Lease renewal rate",
                        "Average rental rate achieved vs. market",
                        "Leasing velocity (time taken to lease vacant spaces)",
                        "Tenant satisfaction score"
                    ]
                }
            ]
        },
        {
            id: "property-manager",
            title: "Property Manager",
            intro: "A Property Manager in a Real Estate Investment Trust (REIT) is responsible for the day-to-day operations and maintenance of the REIT’s properties, ensuring that the properties are well-maintained, tenants are satisfied, and operational costs are controlled to protect and enhance property value.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Operational Management: Oversee daily operations of residential, commercial, or industrial properties. Ensure all building systems (HVAC, plumbing, electrical, security) are functioning properly. Coordinate regular maintenance, repairs, and cleaning services.",
                        "Tenant Relations: Act as the primary point of contact for tenants. Handle tenant inquiries, complaints, and service requests promptly. Manage tenant move-ins, move-outs, and conduct property inspections.",
                        "Rent Collection & Financial Administration: Collect rents and ensure timely payments. Enforce lease terms, including handling late payments or breaches. Manage property budgets, track expenses, and provide financial reports to asset managers.",
                        "Vendor & Contractor Management: Select, negotiate, and oversee third-party vendors and contractors. Ensure service contracts meet quality and cost standards. Supervise work done on the property and ensure compliance with safety standards.",
                        "Regulatory Compliance & Risk Management: Ensure properties comply with local laws, safety regulations, and environmental standards. Manage insurance policies and claims. Conduct regular safety inspections and implement risk mitigation measures.",
                        "Reporting & Coordination: Provide regular operational, financial, and occupancy reports to asset managers. Coordinate with leasing, asset management, and maintenance teams. Support budgeting and capital expenditure planning by providing operational insights."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong organizational and multitasking abilities.",
                        "Excellent communication and tenant service skills.",
                        "Knowledge of property maintenance, local regulations, and safety standards.",
                        "Basic financial and budgeting skills.",
                        "Ability to manage vendors and contractors effectively."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree or diploma in Property Management, Real Estate, Business, or related fields.",
                        "Certifications like Certified Property Manager (CPM) or Real Property Administrator (RPA) are beneficial."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Property Coordinator → Property Manager → Senior Property Manager → Regional Manager → Director of Property Management"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Occupancy and tenant retention rates",
                        "Rent collection rate",
                        "Maintenance cost control",
                        "Tenant satisfaction scores",
                        "Response time to tenant requests and maintenance issues"
                    ]
                }
            ]
        },
        {
            id: "facilities-manager",
            title: "Facilities Manager",
            intro: "A Facilities Manager in a Real Estate Investment Trust (REIT) is responsible for ensuring that the physical infrastructure and operational systems of the REIT’s properties are safe, efficient, and well-maintained. Their focus is primarily on building systems, services, and infrastructure—not just tenant services—making them essential for keeping commercial, residential, and industrial properties operational and compliant.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Building Operations & Maintenance: Oversee the operation of mechanical, electrical, plumbing (MEP), HVAC, elevators, fire safety, and security systems. Ensure preventive and reactive maintenance schedules are executed effectively. Implement energy efficiency measures and sustainability practices.",
                        "Vendor & Contractor Management: Hire and supervise service providers for cleaning, landscaping, security, pest control, etc. Ensure contracts are cost-effective and service quality meets SLAs (Service Level Agreements). Inspect vendor performance and approve invoices.",
                        "Health, Safety & Compliance: Enforce building safety codes, fire safety norms, and OSHA/local regulations. Conduct routine safety audits and risk assessments. Maintain emergency preparedness plans and conduct drills.",
                        "Facility Upgrades & Capital Projects: Plan and oversee renovations, retrofits, or major facility upgrades. Coordinate with engineers, architects, and contractors for CapEx projects. Track timelines, costs, and quality for capital improvement works.",
                        "Energy Management & Sustainability: Monitor energy consumption, water usage, and waste management. Implement green building practices and compliance with LEED/BREEAM or local sustainability standards. Recommend and implement energy-saving technologies or upgrades.",
                        "Budgeting & Reporting: Prepare and manage O&M (Operations & Maintenance) budgets for each property. Track facility-related expenses and report variances to property or asset managers. Provide performance reports on maintenance KPIs, incidents, and energy use."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Deep knowledge of building systems (HVAC, electrical, plumbing, fire safety).",
                        "Strong project management and vendor coordination skills.",
                        "Understanding of safety regulations and sustainability practices.",
                        "Technical proficiency in BMS (Building Management Systems), CMMS (Computerized Maintenance Management Systems), and energy dashboards.",
                        "Attention to detail and problem-solving mindset."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree or diploma in Facilities Management, Mechanical/Electrical Engineering, Architecture, or related fields.",
                        "Certifications such as FMP (Facility Management Professional), CFM (Certified Facility Manager), or LEED Accredited Professional are advantageous."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Facility Supervisor → Facilities Manager → Senior Facilities Manager → Head of Facilities / Director of Operations"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Equipment uptime/availability",
                        "Energy and utility cost savings",
                        "Facility incident response time",
                        "Maintenance cost per sq. ft.",
                        "Compliance audit score"
                    ]
                }
            ]
        },
        {
            id: "development-manager",
            title: "Development Manager",
            intro: "A Development Manager in a Real Estate Investment Trust (REIT) is responsible for managing the planning, design, approval, and construction of new development and redevelopment projects. Their primary goal is to deliver high-quality, cost-effective, and timely real estate developments that align with the REIT’s investment strategy and financial goals.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Project Feasibility & Planning: Conduct feasibility studies for new developments or redevelopments. Work with acquisitions and finance teams to analyze ROI, IRR, and project risk. Create business cases, timelines, and budgets for approval by senior leadership.",
                        "Design & Entitlement Management: Coordinate with architects, planners, and consultants for project design. Manage zoning approvals, permits, and environmental clearances from local authorities. Ensure projects comply with building codes, legal regulations, and sustainability standards.",
                        "Construction Oversight: Lead construction planning and execution, including selecting contractors and monitoring site work. Track progress, control costs, and ensure delivery schedules are met. Resolve construction issues, design conflicts, or logistical challenges.",
                        "Stakeholder Coordination: Liaise with internal teams—acquisitions, asset management, finance, legal, and leasing—to ensure alignment. Engage with government agencies, utility providers, and community stakeholders. Ensure tenant fit-out coordination where applicable (especially in retail/commercial projects).",
                        "Budgeting & Cost Control: Develop and manage CapEx budgets for development projects. Monitor project expenditures and ensure cost adherence. Approve change orders, control contingencies, and optimize project value.",
                        "Handover & Post-Completion Review: Oversee final inspections, occupancy permits, and handover to property/asset management. Conduct project reviews to evaluate performance vs. expectations (cost, quality, timeline, ROI). Document lessons learned for future developments."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong knowledge of real estate development processes.",
                        "Expertise in budgeting, scheduling, and construction management.",
                        "Ability to manage multiple consultants, contractors, and stakeholders.",
                        "Understanding of urban planning, design principles, and entitlement processes.",
                        "Proficiency with project management tools (e.g., MS Project, Primavera, Procore)."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Architecture, Civil Engineering, Construction Management, Urban Planning, or Real Estate.",
                        "Advanced degrees (e.g., MBA, Master of Real Estate Development) are often preferred.",
                        "PMP (Project Management Professional) or similar certifications are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Development Analyst → Development Associate → Development Manager → Senior Development Manager → VP/Director of Development"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Project delivery on time and on budget",
                        "Development ROI vs. projections",
                        "Percentage of entitlement success",
                        "Cost per square foot vs. market benchmark",
                        "Tenant or buyer satisfaction (if applicable)"
                    ]
                }
            ]
        },
        {
            id: "construction-project-manager",
            title: "Construction Project Manager",
            intro: "A Construction Project Manager in a Real Estate Investment Trust (REIT) oversees the execution of construction activities from groundbreaking to project completion. Their primary responsibility is to ensure that development and redevelopment projects are delivered on time, within budget, and to the required quality standards, while managing all contractors, consultants, and on-site logistics.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Construction Planning: Develop detailed construction schedules, budgets, and execution strategies. Coordinate construction sequencing with architects, engineers, and development managers. Establish timelines, critical path activities, and project milestones.",
                        "On-Site Project Management: Supervise construction sites, ensuring compliance with plans, safety standards, and quality. Resolve on-site issues including delays, material shortages, or labor conflicts. Ensure the availability of materials, labor, and permits as needed.",
                        "Contractor & Vendor Coordination: Select, negotiate, and manage general contractors, subcontractors, and vendors. Monitor contractor performance to ensure timelines and quality standards are met. Approve invoices, change orders, and resolve disputes.",
                        "Cost & Budget Control: Track construction expenses against the approved budget. Identify cost overruns early and implement corrective actions. Manage contingencies and provide regular financial reporting.",
                        "Quality Assurance & Safety: Conduct regular inspections to verify workmanship, materials, and compliance. Ensure that safety protocols (OSHA/local safety regulations) are followed on-site. Manage risk assessments and incident reports.",
                        "Documentation & Reporting: Maintain detailed construction documentation: drawings, change orders, RFIs, submittals, and meeting minutes. Provide progress updates to development managers, asset managers, and executives. Prepare completion reports, punch lists, and as-built records."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong knowledge of construction methods, codes, and project management principles.",
                        "Excellent leadership and communication skills.",
                        "Proficient in project scheduling tools (e.g., MS Project, Primavera) and construction software (e.g., Procore, Buildertrend, Bluebeam).",
                        "Capable of reading blueprints, engineering plans, and technical specs.",
                        "Problem-solving skills and the ability to make quick decisions on-site."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Degree in Civil Engineering, Construction Management, Architecture, or related field.",
                        "PMP (Project Management Professional), CCM (Certified Construction Manager), or equivalent certifications are advantageous."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Site Engineer / Construction Supervisor → Assistant Project Manager → Construction Project Manager → Senior PM → Director of Construction / Head of Development Execution"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "On-time project completion rate",
                        "Cost variance (% over/under budget)",
                        "Safety incident rate",
                        "Change order frequency and value",
                        "Quality inspection success rate"
                    ]
                }
            ]
        },
        {
            id: "financial-analyst",
            title: "Financial Analyst",
            intro: "A Financial Analyst in a Real Estate Investment Trust (REIT) plays a critical role in analyzing and supporting the financial performance of the REIT’s investment portfolio. They help drive data-backed decisions by evaluating real estate investments, monitoring asset performance, forecasting financial outcomes, and preparing reports for stakeholders.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "Investment Analysis & Underwriting: Build detailed financial models (DCF, IRR, NPV, cash-on-cash returns) to evaluate acquisition, development, or disposition opportunities. Perform sensitivity and scenario analyses to assess risk and return profiles. Underwrite property-level metrics such as rent growth, occupancy, cap rates, and expenses.",
                        "Budgeting & Forecasting: Assist in annual budget preparation for property operations, development projects, and corporate expenses. Generate short- and long-term financial forecasts for income, cash flow, and capital expenditures. Update models based on market shifts, leasing activity, or capital improvements.",
                        "Performance Tracking & Reporting: Analyze actual vs. projected financial performance of assets and portfolios. Prepare internal reports, investor presentations, and board-level financial summaries. Track KPIs such as NOI, occupancy, rent collections, and returns.",
                        "Market & Competitor Research: Monitor economic indicators, market rent trends, and comparable sales or lease comps. Benchmark REIT performance against peers and industry averages. Support strategic decisions by providing data-backed insights.",
                        "Support Strategic Initiatives: Assist in M&A evaluations, refinancing options, and capital restructuring. Help develop business plans for new developments or repositioning assets. Work with acquisitions, asset management, and investor relations teams on financial deliverables."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Proficiency in Excel (advanced modeling), PowerPoint, and financial software (Argus, Yardi, MRI, CoStar).",
                        "Strong understanding of real estate finance concepts (IRR, cap rate, DSCR, etc.).",
                        "Analytical thinking and attention to detail.",
                        "Effective written and verbal communication for reporting insights."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s degree in Finance, Real Estate, Accounting, or Economics.",
                        "CFA, CAIA, or certifications in real estate finance are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Financial Analyst → Senior Financial Analyst → Finance Manager / Acquisitions Analyst → Director of Finance / VP of Investments"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy of financial forecasts vs. actuals",
                        "Turnaround time for investment analysis",
                        "Number of models completed or updated",
                        "Portfolio return metrics (IRR, yield, NOI growth)",
                        "Efficiency of capital deployed"
                    ]
                }
            ]
        },
        {
            id: "reit-tax-accountant",
            title: "REIT Tax Accountant",
            intro: "A REIT Tax Accountant plays a specialized and critical role in ensuring that a Real Estate Investment Trust (REIT) remains compliant with tax regulations while optimizing its tax position. Since REITs are subject to unique IRS requirements (especially in the U.S. or similar jurisdictions), the Tax Accountant ensures that the REIT meets all legal tax obligations, qualifies for favorable tax treatment, and avoids penalties.",
            sections: [
                {
                    heading: "Core Responsibilities",
                    icon: "🧭",
                    items: [
                        "REIT Compliance Monitoring: Ensure the REIT maintains its tax-qualified status by complying with IRS requirements such as: The 95% gross income test. The 75% real estate income test. The 90% dividend distribution requirement. Track and verify compliance with asset and ownership tests.",
                        "Tax Planning & Strategy: Develop tax strategies to minimize tax liability while remaining compliant. Structure property transactions (acquisitions, dispositions, 1031 exchanges) in a tax-efficient manner. Advise on entity structuring, debt financing, and leasing arrangements from a tax perspective.",
                        "Tax Return Preparation & Filings: Prepare and file federal, state, and local tax returns (e.g., Form 1120-REIT in the U.S.). Calculate taxable income, deferred taxes, and maintain proper tax records. File returns for subsidiary REITs, taxable REIT subsidiaries (TRS), and other pass-through entities.",
                        "Dividend & Distribution Tax Support: Track dividend distribution requirements to ensure compliance with the 90% rule. Help calculate Qualified Dividend Income (QDI) and other components for shareholder tax reporting. Assist investor relations in preparing tax-related shareholder communications (e.g., 1099s, K-1s).",
                        "Audit & Regulatory Support: Support internal and external audits by tax authorities. Prepare documentation and respond to tax notices, inquiries, and audit requests. Maintain current knowledge of REIT-related tax legislation and court rulings.",
                        "Coordination & Reporting: Work closely with finance, legal, and external tax advisors. Prepare tax provision calculations and reporting for financial statements (ASC 740). Contribute to quarterly and annual SEC reporting (if publicly traded)."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong understanding of REIT tax regulations, IRS codes, and corporate tax laws.",
                        "Proficiency with tax software (e.g., GoSystem, OneSource, Corptax) and ERP systems.",
                        "Analytical thinking and strong attention to detail.",
                        "Ability to interpret tax laws and explain their impact clearly."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Accounting, Taxation, or related field.",
                        "CPA (Certified Public Accountant) or equivalent tax certification is highly preferred.",
                        "Prior experience in public accounting (Big Four or REIT-focused firms) is a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Tax Associate → Tax Accountant → Senior Tax Accountant → Tax Manager → Director of Tax / VP of Tax"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy of tax filings",
                        "Timeliness of tax returns and dividend compliance",
                        "Audit risk and exposure level",
                        "Tax savings achieved through planning",
                        "Compliance with REIT qualification tests"
                    ]
                }
            ]
        },
        {
            id: "controller-cfo",
            title: "Controller / CFO",
            intro: "In the context of Indian real estate, a Controller or Chief Financial Officer (CFO) plays a strategic and leadership role overseeing the financial health, compliance, and capital strategy of a real estate company—be it a developer, REIT, or real estate investment platform. Their primary objective is to ensure financial discipline, optimize capital structures, and support sustainable growth while navigating the complex regulatory, tax, and funding environment of Indian real estate.",
            sections: [
                {
                    heading: "Role of Controller / CFO in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Financial Strategy & Capital Structuring: Develop capital raising strategies (debt, equity, mezzanine financing, joint ventures). Structure SPVs (Special Purpose Vehicles) or REITs efficiently to manage investments. Evaluate cost of capital and optimize capital mix for various projects. Work with investment banks, NBFCs, HFCs, AIFs, and private equity funds.",
                        "Project & Corporate Financial Management: Oversee project-wise budgeting, forecasting, and fund flow monitoring. Approve and track capital expenditure (CapEx) and operational expenditure (OpEx). Ensure adequate working capital availability for ongoing developments. Implement project cash flow waterfall mechanisms (as per RERA guidelines).",
                        "Accounting, Reporting & Audits: Ensure accurate financial accounting under Ind AS / IFRS. Coordinate statutory, internal, and RERA audits. Prepare and present financial statements, MIS reports, and investor dashboards.",
                        "Compliance & Regulatory Management: Ensure compliance with: RERA (Real Estate Regulation and Development Act). GST and input credit management. Income Tax Act (especially for capital gains, TDS, and MAT). FEMA (for FDI in real estate) and SEBI REIT Regulations. Oversee filings with MCA, SEBI (for listed entities), and tax authorities.",
                        "Investor Relations & Fund Management: Engage with institutional investors, analysts, and lenders. Support fundraising via REITs, InvITs, or private placements. Provide transparent financial disclosures and performance updates.",
                        "Risk Management & Internal Controls: Establish robust internal controls over project costing, vendor payments, and cash handling. Mitigate financial risks like cost overruns, fund misuse, or legal exposures. Conduct scenario modeling and stress testing for market or interest rate volatility.",
                        "Technology & Financial Systems Implementation: Drive implementation of ERP tools like SAP, Oracle, or real estate-specific solutions (e.g., FAR Vision, BuildSupply). Ensure integration of finance, procurement, and project management systems."
                    ]
                },
                {
                    heading: "Key Skills & Tools",
                    icon: "🛠️",
                    items: [
                        "Expertise in Ind AS, GST, Direct Taxes, RERA, and REIT regulations.",
                        "Proficiency in Excel modeling, ERP systems, and BI tools.",
                        "Strong understanding of real estate project lifecycle and financing."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "CA (Chartered Accountant) or MBA (Finance).",
                        "Additional certifications in IFRS, Ind AS, or REIT structures are beneficial."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Financial Analyst → Finance Manager → Financial Controller → CFO → Group CFO / Board Director"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Cost of capital / Return on capital employed (ROCE)",
                        "Financial compliance score (audits, tax filings)",
                        "Cash flow efficiency (DSO, DPO, working capital cycle)",
                        "EBITDA margin and profit performance per project",
                        "Investor satisfaction and successful fundraising rounds"
                    ]
                }
            ]
        },
        {
            id: "legal-counsel",
            title: "Legal Counsel",
            intro: "In Indian real estate, a Legal Counsel plays a pivotal role in ensuring that all transactions, developments, investments, and operational activities comply with the country's complex legal and regulatory framework. Whether working for a developer, a REIT, or a real estate investment platform, the Legal Counsel safeguards the organization from legal risks while enabling smooth business operations.",
            sections: [
                {
                    heading: "Role of Legal Counsel in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Due Diligence & Title Verification: Conduct legal due diligence on land and property titles. Verify encumbrances, land ownership, revenue records, and development rights. Ensure properties are free from disputes, litigations, and third-party claims. Scrutinize conversion status (agricultural to non-agricultural), zoning, and master plans.",
                        "Drafting & Vetting Agreements: Draft and review a wide range of real estate documents: Agreement to Sell / Sale Deeds. Joint Development Agreements (JDA). Lease Deeds and Leave & License Agreements. Construction and PMC Contracts. Mortgage and Loan Agreements. Vendor/Contractor Agreements. Ensure enforceability, risk mitigation, and compliance with local laws.",
                        "Regulatory Compliance & Advisory: Ensure compliance with key real estate laws and regulations such as: RERA (Real Estate Regulation and Development Act). Transfer of Property Act. Stamp Duty & Registration Act. Environment & Land Acquisition Laws. SEBI REIT Regulations (for listed entities). Provide legal input on FDI, FEMA, and foreign investment in Indian real estate.",
                        "Litigation & Dispute Resolution: Represent the organization in property-related litigation, arbitrations, and consumer cases (especially under RERA or NCDRC). Liaise with external counsels and manage case strategy. Aim for out-of-court settlements where possible to reduce reputational and financial risk.",
                        "Support for Investments & REIT Transactions: Support legal structuring for REITs, InvITs, and AIF-backed projects. Draft legal opinions on ownership, leasehold structures, and regulatory readiness. Conduct legal audits for REIT-eligible portfolios and assist in disclosures.",
                        "Licensing & Approvals: Oversee the legal documentation required for municipal approvals, fire NOCs, environmental clearances, etc. Ensure all licenses are valid and renewed on time.",
                        "Corporate & Compliance Work: Ensure compliance with the Companies Act, SEBI, and Income Tax law (as applicable). Assist in board resolutions, minutes, and legal notices. Support the finance team with legal aspects of project financing or IPOs."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "In-depth knowledge of real estate, land, and property laws in India.",
                        "Strong contract drafting, negotiation, and litigation skills.",
                        "Familiarity with RERA, municipal laws, and environmental regulations.",
                        "Proficiency in reviewing complex legal and title documents."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "LLB (Bachelor of Laws) from a recognized university.",
                        "Specialization or LLM in Real Estate Law, Corporate Law, or Property Law is a plus.",
                        "Bar Council registration for practicing law in India."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Legal Associate → In-house Counsel → Senior Legal Manager → Head of Legal → General Counsel"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Number of legal risks mitigated / resolved",
                        "Speed and accuracy of due diligence reports",
                        "Legal compliance score (RERA, title clearances, regulatory filings)",
                        "Litigation win rate or settlements achieved",
                        "Efficiency in contract turnaround time"
                    ]
                }
            ]
        },
        {
            id: "compliance-officer",
            title: "Compliance Officer",
            intro: "In the Indian real estate sector, a Compliance Officer ensures that the company adheres to all applicable legal, regulatory, and internal governance standards. This role is especially critical in regulated environments such as REITs, listed real estate companies, or those with foreign investments, where compliance lapses can lead to major penalties, investor distrust, or even suspension of business operations.",
            sections: [
                {
                    heading: "Role of a Compliance Officer in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Regulatory Compliance Monitoring: Ensure compliance with: RERA (Real Estate Regulation and Development Act, 2016). SEBI regulations (for listed entities and REITs). FEMA and FDI norms for foreign investment in real estate. Companies Act, 2013. Environmental and zoning laws. GST, TDS, and other tax-related regulations. Track changes in regulatory frameworks and update internal processes accordingly.",
                        "RERA Registration & Reporting: Ensure timely registration of real estate projects and agents with RERA authorities. File regular RERA compliance reports (Form 1, 2, 3, etc.). Monitor fund utilization as per the 70% escrow rule under RERA.",
                        "Internal Policies & Risk Controls: Develop, implement, and monitor standard operating procedures (SOPs) to ensure internal compliance. Set up a compliance risk framework for real estate transactions, land acquisition, sales, leasing, and financing. Conduct internal audits to test adherence to company policies and regulations.",
                        "SEBI & REIT Compliance (If Applicable): Ensure REITs follow SEBI’s REIT Regulations, 2014 for: Investment limits. Valuation norms. Related party transactions. Disclosure and reporting. Ensure timely submission of offer documents, annual reports, and investor communications.",
                        "Stakeholder Reporting & Liaison: Liaise with regulatory bodies such as: RERA Authorities. SEBI. MCA (Ministry of Corporate Affairs). Tax departments. Environmental and municipal authorities. Prepare regular compliance reports for management and the board.",
                        "Training & Awareness: Conduct periodic training for staff, sales teams, and agents on compliance obligations (especially RERA and Anti-Money Laundering). Create a compliance culture within the organization."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong knowledge of real estate laws, corporate governance, and regulatory frameworks in India.",
                        "Eye for detail, excellent documentation skills, and ability to interpret legal statutes.",
                        "Familiarity with compliance software and ERP systems (e.g., SAP GRC, MetricStream)."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s degree in Law, Commerce, or Business.",
                        "Preferred: Company Secretary (CS), LLB, or certifications in compliance or governance.",
                        "Experience in real estate or financial services is a major advantage."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Compliance Analyst → Compliance Manager → Senior Compliance Officer → Head of Compliance / Chief Compliance Officer"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Timeliness and accuracy of regulatory filings (RERA, SEBI, MCA)",
                        "Number of compliance breaches or audit observations",
                        "Internal compliance audit scores",
                        "Regulatory penalties or warnings avoided",
                        "Employee compliance training completion rate"
                    ]
                }
            ]
        },
        {
            id: "investor-relations-analyst",
            title: "Investor Relations Analyst",
            intro: "An Investor Relations Analyst in the Indian real estate sector—especially within REITs, listed real estate companies, or large private real estate platforms—acts as a bridge between the company and its investors, analysts, and the financial community. The primary responsibility is to communicate the financial health, strategy, and value proposition of the company transparently, while also capturing and relaying investor sentiment back to senior management.",
            sections: [
                {
                    heading: "Role of an Investor Relations Analyst in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Financial Communication & Reporting: Assist in preparing and presenting: Quarterly investor presentations. Earnings call scripts and Q&A materials. Annual reports, investor decks, and factsheets. Translate complex real estate financials (rental income, NAV, occupancy, NOI, cap rates) into investor-friendly formats.",
                        "Investor Engagement & Relationship Management: Maintain regular communication with: Institutional investors (mutual funds, REIT investors, private equity). Analysts and rating agencies. Retail shareholders (in case of listed companies or REITs). Coordinate investor meetings, roadshows, conferences, and virtual presentations.",
                        "Market Intelligence & Peer Benchmarking: Track market sentiment and analyst reports about the company and its competitors. Conduct peer benchmarking (REIT yield comparisons, property valuations, leasing metrics). Monitor share price movement, trading volumes, and investor activity.",
                        "Data & Insights for Management: Gather investor feedback post-earnings calls and brief senior leadership on perception. Create dashboards on shareholder composition, market trends, and fund flows. Assist in scenario modeling for guidance updates and investor expectations management.",
                        "Regulatory Compliance & Disclosures: Ensure timely filing of disclosures to SEBI, BSE/NSE (if listed), including: Shareholding patterns. Earnings announcements. Price-sensitive information. Support SEBI REIT compliance on disclosure and transparency norms."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong understanding of financial modeling, real estate metrics (NOI, IRR, NAV, Cap Rate), and REIT structures.",
                        "Excellent communication and presentation skills.",
                        "Familiarity with tools like Bloomberg, FactSet, Excel, PowerPoint, and CRM platforms.",
                        "Ability to handle analyst queries and investor pressure with maturity and discretion."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor's or Master’s in Finance, Commerce, Economics, or Business.",
                        "Preferred: MBA (Finance), CFA, or CA with a capital markets orientation.",
                        "Experience in real estate, financial services, or investor relations is a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["IR Analyst → Senior IR Analyst → IR Manager → Head of Investor Relations / CFO track"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy and clarity of investor communication",
                        "Investor satisfaction and retention",
                        "Timeliness of disclosures and earnings releases",
                        "Analyst coverage and sentiment score",
                        "Participation and feedback from investor meetings"
                    ]
                }
            ]
        },
        {
            id: "capital-markets-manager",
            title: "Capital Markets Manager",
            intro: "In the Indian real estate sector, a Capital Markets Manager plays a crucial role in raising funds, managing investor relations, and structuring capital-raising transactions for real estate companies, REITs, or real estate investment platforms. They act as the bridge between the company and the financial markets (equity, debt, private equity, and institutional investors) to secure capital for projects and expansions.",
            sections: [
                {
                    heading: "Role of a Capital Markets Manager in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Fundraising & Transaction Structuring: Plan and execute capital raising initiatives through: Equity offerings (private placements, IPOs, follow-ons). Debt financing (bank loans, bonds, NCDs). Alternative financing routes (REIT listings, InvITs, AIFs). Structure transactions to optimize cost of capital and compliance with regulatory frameworks like SEBI and RBI.",
                        "Investor & Stakeholder Engagement: Manage relationships with institutional investors, private equity funds, banks, NBFCs, and rating agencies. Prepare detailed investment memorandums, pitch decks, and financial models to support fundraising. Organize roadshows, investor meetings, and capital market events.",
                        "Market & Competitor Analysis: Monitor capital market trends relevant to real estate, such as interest rate movements, equity market conditions, and investor sentiment. Analyze competitor fundraising strategies and pricing benchmarks. Assess the impact of macroeconomic factors on funding options.",
                        "Regulatory Compliance & Documentation: Ensure adherence to SEBI regulations, RBI guidelines, and other statutory requirements during fundraising. Liaise with legal and compliance teams to prepare and review offering documents, prospectuses, and disclosures. Coordinate with stock exchanges, registrar and transfer agents for listed entities.",
                        "Capital Allocation & Reporting: Collaborate with finance and project teams to allocate raised capital efficiently across projects. Track utilization of funds and report to investors and regulators. Monitor debt covenants, repayment schedules, and refinancing options."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Deep knowledge of Indian capital markets, securities laws, and financing instruments.",
                        "Strong financial modeling and valuation skills.",
                        "Excellent communication and negotiation abilities.",
                        "Familiarity with SEBI, RBI, and real estate sector regulations.",
                        "Relationship management with institutional investors and bankers."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Finance, Commerce, or Business.",
                        "Preferred qualifications: MBA (Finance), CFA, CA, or Chartered Financial Analyst certifications.",
                        "Prior experience in investment banking, private equity, or corporate finance within real estate or infrastructure sectors."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Capital Markets Analyst → Associate Manager → Capital Markets Manager → Director of Capital Markets / CFO"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Amount of capital successfully raised",
                        "Cost of capital achieved (interest rates, dilution)",
                        "Investor satisfaction and repeat investments",
                        "Compliance and timely filing of regulatory documents",
                        "Efficient capital deployment and utilization reports"
                    ]
                }
            ]
        },
        {
            id: "market-research-analyst",
            title: "Market Research Analyst",
            intro: "In the Indian real estate sector, a Market Research Analyst plays a vital role in gathering, analyzing, and interpreting data related to real estate markets, consumer trends, and economic factors. Their insights help developers, investors, REITs, and asset managers make informed decisions about acquisitions, developments, pricing, and marketing strategies.",
            sections: [
                {
                    heading: "Role of a Market Research Analyst in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Data Collection & Analysis: Collect data on property prices, rental yields, vacancy rates, supply and demand dynamics, and demographic trends. Use primary research methods like surveys, interviews, and focus groups with buyers, tenants, brokers, and developers. Analyze secondary data from government records, RERA filings, industry reports, and market databases.",
                        "Market Trend Forecasting: Monitor economic indicators, infrastructure developments, policy changes, and urban growth patterns. Forecast real estate cycles, demand-supply gaps, and investment hotspots. Provide predictive analytics on price appreciation, rental growth, and absorption rates.",
                        "Competitor & Product Analysis: Analyze competitors’ projects, pricing strategies, amenities, and sales performance. Benchmark against comparable projects to assess market positioning. Study consumer preferences for property types, layouts, and financing options.",
                        "Reporting & Presentation: Prepare detailed market research reports, whitepapers, and dashboards. Present findings and strategic recommendations to developers, investors, and marketing teams. Support project feasibility studies and investment committee decisions.",
                        "Support for Sales & Marketing: Identify target customer segments and geographic areas for marketing campaigns. Track effectiveness of promotions, sales velocity, and customer feedback. Advise on product enhancements or positioning based on market insights."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong analytical and statistical skills.",
                        "Proficiency in data tools like Excel, SPSS, Tableau, or Power BI.",
                        "Good understanding of Indian real estate market and regulatory environment.",
                        "Effective communication and report-writing skills."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Economics, Statistics, Urban Planning, Business, or related fields.",
                        "Additional certifications in market research or real estate analytics are advantageous."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Research Associate → Market Research Analyst → Senior Analyst → Market Research Manager → Director of Research"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy and timeliness of market reports",
                        "Predictive reliability of market forecasts",
                        "Impact of research on sales and investment decisions",
                        "Client or stakeholder satisfaction scores"
                    ]
                }
            ]
        },
        {
            id: "strategic-planner",
            title: "Strategic Planner",
            intro: "In Indian real estate, a Strategic Planner plays a crucial role in shaping the long-term growth and competitive positioning of real estate companies, REITs, or development projects. They analyze market trends, financial data, and business objectives to craft strategies that maximize profitability, optimize asset utilization, and ensure sustainable development.",
            sections: [
                {
                    heading: "Role of a Strategic Planner in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Long-Term Business Strategy Development: Develop and refine corporate strategies aligned with market conditions, company goals, and regulatory landscape. Identify growth opportunities such as new markets, property types, or investment vehicles (e.g., REITs, affordable housing). Evaluate potential joint ventures, partnerships, and mergers/acquisitions.",
                        "Market & Competitive Analysis: Analyze competitor moves, industry trends, and economic indicators impacting the real estate sector. Use market intelligence to anticipate risks and shifts in demand. Benchmark company performance against peers.",
                        "Portfolio & Asset Optimization: Recommend optimal asset allocation across geographies, property types, and investment strategies. Assess underperforming assets and recommend redevelopment, repositioning, or disposal. Collaborate with asset and portfolio managers to align operational execution with strategy.",
                        "Financial Modeling & Scenario Planning: Create detailed financial models forecasting revenue, costs, cash flows, and returns under multiple scenarios. Support investment committees and leadership with data-driven decision making. Analyze impacts of policy changes, interest rate fluctuations, and funding availability.",
                        "Stakeholder Communication & Implementation Support: Translate strategic plans into actionable roadmaps for project, marketing, and finance teams. Monitor progress and adjust plans based on changing market or operational realities. Present strategy updates and insights to senior management and investors."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong analytical and financial modeling expertise.",
                        "Deep understanding of Indian real estate markets, policies, and regulatory environment.",
                        "Ability to synthesize complex data into clear strategic recommendations.",
                        "Excellent communication and leadership skills."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Business, Finance, Urban Planning, or Real Estate.",
                        "MBA or specialized real estate certifications preferred."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Business Analyst → Strategic Planner → Strategy Manager → Head of Strategy / Chief Strategy Officer"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Achievement of strategic growth targets (revenue, market share)",
                        "Accuracy of market forecasts and scenario analyses",
                        "Successful execution of strategic initiatives",
                        "Stakeholder satisfaction and buy-in"
                    ]
                }
            ]
        },
        {
            id: "data-analyst",
            title: "Data Analyst",
            intro: "In the Indian real estate sector, a Data Analyst plays a critical role in turning vast amounts of property, market, and operational data into actionable insights. This helps real estate firms, REITs, and investment platforms optimize decision-making, enhance customer targeting, and improve operational efficiency.",
            sections: [
                {
                    heading: "Role of a Data Analyst in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Data Collection & Management: Gather data from various sources including property listings, sales transactions, RERA databases, market surveys, and CRM systems. Clean, validate, and organize large datasets to ensure accuracy and consistency.",
                        "Data Analysis & Reporting: Analyze data trends related to property prices, rental yields, occupancy rates, and customer demographics. Create reports, dashboards, and visualizations to present findings clearly to business stakeholders. Use statistical techniques and tools to identify correlations, anomalies, and predictive patterns.",
                        "Market & Customer Insights: Help marketing and sales teams by segmenting customers, identifying potential leads, and measuring campaign effectiveness. Analyze competitor pricing, supply-demand gaps, and customer preferences. Support portfolio managers by providing insights on asset performance and market positioning.",
                        "Operational Optimization: Work with project teams to monitor construction progress, budget adherence, and resource utilization through data tracking. Identify bottlenecks and inefficiencies to recommend process improvements.",
                        "Tool & Technology Utilization: Use tools such as Excel, SQL, Python, R, Tableau, Power BI, or GIS mapping software for data analysis and visualization. Implement data automation workflows and predictive analytics models."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong analytical and statistical skills.",
                        "Proficiency with data querying languages (SQL), data visualization tools (Tableau, Power BI).",
                        "Knowledge of programming languages like Python or R for advanced analytics.",
                        "Understanding of real estate market dynamics and terminology.",
                        "Attention to detail and problem-solving mindset."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Statistics, Mathematics, Economics, Computer Science, or related fields.",
                        "Certifications in data analytics or business intelligence are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Junior Data Analyst → Data Analyst → Senior Data Analyst → Data Scientist / Analytics Manager"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy and timeliness of data reports.",
                        "Data-driven improvements in sales or operational KPIs.",
                        "User adoption of dashboards and analytical tools.",
                        "Number of predictive models implemented successfully."
                    ]
                }
            ]
        },
        {
            id: "it-proptech-manager",
            title: "IT / PropTech Manager",
            intro: "In the Indian real estate sector, an IT / PropTech Manager is responsible for managing and implementing technology solutions that enhance real estate operations, improve customer experience, and drive innovation through PropTech (Property Technology) initiatives. This role bridges traditional real estate with modern technology, helping companies stay competitive and efficient.",
            sections: [
                {
                    heading: "Role of an IT / PropTech Manager in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Technology Strategy & Implementation: Develop and execute IT strategy aligned with the company’s real estate business goals. Identify and implement PropTech solutions such as property management systems, smart building technologies, virtual reality tours, and AI-driven analytics. Manage integration of software platforms for sales, leasing, asset management, and construction monitoring.",
                        "Infrastructure & Systems Management: Oversee the maintenance of IT infrastructure including servers, networks, cloud services, and cybersecurity. Ensure data security and compliance with regulations like IT Act 2000 and data privacy laws. Manage vendor relationships for software licenses, hardware procurement, and tech support.",
                        "Digital Transformation & Innovation: Lead digital transformation initiatives to automate workflows, improve data management, and enhance tenant and investor portals. Explore emerging technologies such as IoT for smart buildings, blockchain for property transactions, and AI for predictive analytics. Drive adoption of mobile apps, online booking, e-signatures, and digital payment systems.",
                        "Team Leadership & Training: Manage IT and PropTech teams including developers, system admins, and support staff. Train employees on new technologies and cybersecurity best practices. Coordinate with cross-functional teams (marketing, sales, finance, operations) for smooth technology adoption.",
                        "Project Management & Budgeting: Plan, prioritize, and oversee IT projects ensuring timely delivery within budget. Monitor KPIs related to system uptime, user satisfaction, and technology ROI. Prepare budgets and forecasts for technology investments."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong knowledge of IT infrastructure, software development, and PropTech trends.",
                        "Experience with real estate management software (e.g., Yardi, MRI, RealPage).",
                        "Understanding of cybersecurity and data privacy standards.",
                        "Project management skills with tools like Agile, Scrum, or PMP methodologies.",
                        "Good communication skills to liaise between tech teams and business units."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Computer Science, Information Technology, or related fields.",
                        "Certifications in project management (PMP), cloud platforms (AWS, Azure), or cybersecurity are advantageous.",
                        "Experience in real estate or construction tech is a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["IT Specialist → IT Manager → PropTech Manager → Head of IT / Chief Technology Officer (CTO)"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "System uptime and incident response times",
                        "Successful implementation of PropTech solutions",
                        "User adoption rates and satisfaction scores",
                        "Cost savings or revenue increases from technology initiatives",
                        "Security incident reduction"
                    ]
                }
            ]
        },
        {
            id: "sales-executive-broker-liaison",
            title: "Sales Executive / Broker Liaison",
            intro: "In the Indian real estate sector, a Sales Executive / Broker Liaison plays a pivotal role in driving property sales and maintaining strong relationships between the real estate company and external brokers or agents. This role ensures smooth coordination and communication to maximize sales performance and client satisfaction.",
            sections: [
                {
                    heading: "Role of Sales Executive / Broker Liaison in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Sales Coordination: Act as the primary point of contact between the company’s sales team and external brokers/agencies. Facilitate lead sharing, deal negotiation, and follow-ups with brokers to convert inquiries into sales. Assist in preparing sales proposals, quotations, and contracts.",
                        "Broker Relationship Management: Build and maintain strong, professional relationships with a network of real estate brokers and agents. Organize broker events, training sessions, and incentive programs to motivate and align them with company goals. Resolve issues related to commissions, documentation, or client concerns promptly.",
                        "Market & Client Insights: Gather market feedback from brokers about buyer preferences, pricing trends, and competitor offerings. Provide insights to the marketing and sales teams for strategy adjustments. Assist brokers with property information, site visits, and marketing materials.",
                        "Sales Reporting & Documentation: Track sales progress, broker performance, and commissions through CRM and sales management systems. Prepare regular reports for sales managers and leadership. Ensure compliance with documentation and regulatory requirements (RERA filings, KYC of buyers).",
                        "Customer Service & Support: Support brokers and customers throughout the sales process to ensure a positive buying experience. Coordinate with legal, finance, and operations teams to expedite deal closure and handovers. Address and resolve post-sale issues or client queries."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong interpersonal and negotiation skills.",
                        "Good understanding of Indian real estate market, regulations (RERA), and sales processes.",
                        "Proficiency with CRM tools and MS Office.",
                        "Ability to manage multiple stakeholders and deadlines.",
                        "Customer-centric attitude and problem-solving abilities."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s degree in Business, Marketing, or related fields preferred.",
                        "Experience in real estate sales or brokerage is advantageous."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Sales Coordinator → Sales Executive / Broker Liaison → Sales Manager → Head of Sales"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Number of deals closed via brokers.",
                        "Broker engagement and satisfaction scores.",
                        "Timeliness and accuracy of sales reporting.",
                        "Customer feedback and repeat business rate."
                    ]
                }
            ]
        },
        {
            id: "marketing-manager-reit",
            title: "Marketing Manager (REIT)",
            intro: "In the context of a Real Estate Investment Trust (REIT) in India, a Marketing Manager is responsible for creating and executing marketing strategies that attract investors, promote REIT offerings, and enhance the brand reputation of the trust. Their role is key to building investor confidence, increasing capital inflow, and ensuring transparent communication.",
            sections: [
                {
                    heading: "Role of a Marketing Manager (REIT) in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Investor Marketing & Branding: Develop and implement marketing campaigns targeting institutional and retail investors. Build brand awareness and trust in the REIT through digital, print, and event marketing. Create investor education content explaining REIT benefits, performance, and compliance.",
                        "Campaign Management & Lead Generation: Plan campaigns around IPOs, follow-on offerings, quarterly earnings releases, and other investor events. Generate and nurture investor leads through online platforms, webinars, roadshows, and conferences. Collaborate with investor relations teams to ensure consistent messaging.",
                        "Content Creation & Communication: Prepare marketing collateral including brochures, presentations, newsletters, and social media content. Manage website content and optimize for SEO related to REIT investment. Coordinate with PR agencies to handle media relations and press releases.",
                        "Market & Competitor Analysis: Monitor market trends, investor sentiment, and competitor REIT offerings. Analyze marketing campaign effectiveness and adjust strategies accordingly. Provide insights to leadership on investor preferences and market opportunities.",
                        "Event Management & Stakeholder Engagement: Organize investor meetups, analyst calls, and participation in investment forums. Ensure compliance with SEBI’s disclosure norms in marketing communications. Collaborate with finance, legal, and compliance teams to vet marketing materials."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong knowledge of financial products, capital markets, and real estate investment.",
                        "Expertise in digital marketing, content strategy, and event planning.",
                        "Excellent communication and presentation skills.",
                        "Familiarity with SEBI regulations for REIT marketing and disclosures.",
                        "Analytical mindset to measure campaign ROI and investor engagement."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s or Master’s degree in Marketing, Finance, Business Administration, or related fields.",
                        "Certifications in digital marketing or financial marketing are a plus."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Marketing Executive → Marketing Manager (REIT) → Senior Marketing Manager → Head of Marketing / Chief Marketing Officer"]
                },
                {
                    heading: "Typical KPIs",
                    icon: "✅",
                    items: [
                        "Investor lead generation and conversion rates.",
                        "Brand awareness and investor engagement metrics.",
                        "Campaign ROI and cost per lead.",
                        "Compliance adherence in marketing materials.",
                        "Investor feedback and satisfaction levels."
                    ]
                }
            ]
        },
        {
            id: "analyst-intern-graduate-analyst",
            title: "Analyst Intern / Graduate Analyst",
            intro: "In the Indian real estate sector, an Analyst Intern or Graduate Analyst typically works at an entry level, supporting senior analysts and teams by assisting with research, data analysis, and reporting. This role is designed to provide hands-on exposure to real estate investment, development, and market analysis, helping the intern/graduate build foundational skills.",
            sections: [
                {
                    heading: "Role of an Analyst Intern / Graduate Analyst in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Data Collection & Research Support: Assist in gathering data on property markets, transactions, rental rates, and economic indicators. Conduct secondary research using online databases, government portals (RERA, land records), and industry reports. Support primary research efforts such as surveys or interviews if required.",
                        "Financial & Market Analysis Assistance: Help prepare financial models for project feasibility, cash flow projections, and investment returns under supervision. Analyze market trends, competitor projects, and consumer preferences. Support due diligence by compiling relevant data and documentation.",
                        "Report Preparation & Presentation: Assist in creating presentations, reports, and dashboards for internal teams and clients. Prepare summaries and charts from raw data to highlight key insights. Ensure accuracy and completeness of data before submission.",
                        "Administrative & Coordination Tasks: Support scheduling and coordination of meetings, site visits, and client interactions. Maintain organized data repositories and documentation. Learn and adhere to compliance and regulatory requirements relevant to real estate.",
                        "Learning & Development: Participate in training sessions on real estate finance, market analysis tools, and software (Excel, Power BI, etc.). Seek feedback and mentorship from senior analysts. Stay updated on industry news, policies, and emerging trends."
                    ]
                },
                {
                    heading: "Key Skills to Develop",
                    icon: "🛠️",
                    items: [
                        "Analytical thinking and attention to detail.",
                        "Basic knowledge of financial modeling and real estate concepts.",
                        "Proficiency in MS Excel, PowerPoint; familiarity with databases and visualization tools is a plus.",
                        "Good communication and teamwork skills.",
                        "Curiosity and eagerness to learn about Indian real estate markets."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Recent graduate or final-year student in Finance, Economics, Real Estate, Urban Planning, Business, or related fields.",
                        "Internships or coursework related to real estate or investment preferred but not mandatory."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Analyst Intern / Graduate Analyst → Junior Analyst → Analyst → Senior Analyst → Specialist or Manager Roles"]
                },
                {
                    heading: "Key Performance Indicators (KPIs)",
                    icon: "✅",
                    items: [
                        "Accuracy and timeliness of research and analysis support.",
                        "Quality of reports and presentations prepared.",
                        "Ability to learn and apply new concepts.",
                        "Feedback from mentors and team members."
                    ]
                }
            ]
        },
        {
            id: "junior-analyst-acquisitions-asset-management",
            title: "Junior Analyst – Acquisitions / Asset Management",
            intro: "In Indian real estate, a Junior Analyst – Acquisitions / Asset Management is an entry-level role supporting senior acquisition or asset management teams by performing data analysis, market research, and financial modeling to help identify, evaluate, and manage real estate investments.",
            sections: [
                {
                    heading: "Role of Junior Analyst – Acquisitions / Asset Management in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Support in Acquisitions: Assist in sourcing and evaluating potential property acquisitions. Collect and analyze data on property performance, market conditions, and financial metrics. Prepare initial financial models and investment summaries under supervision. Coordinate with brokers, legal, and due diligence teams to gather necessary documents.",
                        "Support in Asset Management: Help monitor and analyze the performance of existing property assets (rental income, occupancy, expenses). Assist in preparing monthly/quarterly asset performance reports. Track lease expirations, tenant renewals, and rent escalations. Support budgeting and forecasting processes.",
                        "Market Research & Data Analysis: Conduct research on local real estate markets, trends, and competitor properties. Analyze demographic, economic, and regulatory factors affecting asset value. Use Excel, databases, and visualization tools to generate insights.",
                        "Report Preparation & Documentation: Prepare presentations and reports for senior management and investors. Maintain organized records of acquisition deals and asset performance data. Assist in compliance documentation and regulatory filings.",
                        "Collaboration & Learning: Work closely with senior analysts, asset managers, legal, and finance teams. Participate in site visits, due diligence meetings, and investor calls. Learn real estate valuation methods, portfolio management, and acquisition processes."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Basic financial modeling and analytical skills.",
                        "Understanding of real estate fundamentals and investment concepts.",
                        "Proficiency in MS Excel, PowerPoint, and data visualization tools.",
                        "Good communication and teamwork abilities.",
                        "Eagerness to learn and attention to detail."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s degree in Finance, Real Estate, Economics, Business, or related fields.",
                        "Internship or coursework in real estate or investment analysis is helpful."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Junior Analyst → Analyst → Senior Analyst → Asset Manager / Acquisitions Manager"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Accuracy and timeliness of financial models and reports.",
                        "Quality of market research and investment summaries.",
                        "Contribution to deal sourcing and asset performance monitoring.",
                        "Feedback from team and stakeholders."
                    ]
                }
            ]
        },
        {
            id: "operations-leasing-coordinator",
            title: "Operations / Leasing Coordinator",
            intro: "In the Indian real estate sector, an Operations / Leasing Coordinator plays a vital role in supporting the day-to-day leasing activities and overall operational management of commercial or residential properties. This role ensures smooth leasing processes, tenant coordination, and efficient property operations.",
            sections: [
                {
                    heading: "Role of Operations / Leasing Coordinator in Indian Real Estate",
                    icon: "🧭",
                    items: [
                        "Leasing Support: Coordinate lease agreements, renewals, and terminations between landlords and tenants. Assist in tenant onboarding, including documentation, background checks, and compliance with RERA and other regulations. Maintain lease records, track lease expirations, rent escalations, and payment schedules. Support the leasing team in property showings, negotiations, and client communications.",
                        "Operations Management: Oversee daily property operations, ensuring facilities and services meet tenant needs. Coordinate with maintenance, security, cleaning, and vendor teams for smooth building operations. Track service requests, complaints, and resolution timelines. Assist in budgeting and expense tracking for property operations.",
                        "Documentation & Compliance: Maintain accurate and organized leasing and operational documentation. Ensure compliance with legal, safety, and regulatory requirements (e.g., RERA, local municipal laws). Support audits and inspections by preparing necessary reports and records.",
                        "Reporting & Coordination: Prepare regular reports on occupancy, lease status, rent collection, and maintenance activities. Coordinate between tenants, property managers, finance teams, and external vendors. Facilitate communication regarding lease terms, building policies, and operational updates.",
                        "Customer Service & Tenant Relations: Act as a point of contact for tenant queries, requests, and escalations. Assist in organizing tenant engagement activities or meetings. Work towards enhancing tenant satisfaction and retention."
                    ]
                },
                {
                    heading: "Key Skills Required",
                    icon: "🛠️",
                    items: [
                        "Strong organizational and multitasking abilities.",
                        "Good knowledge of lease documentation and real estate regulations.",
                        "Proficiency with property management software and MS Office.",
                        "Effective communication and interpersonal skills.",
                        "Problem-solving attitude and attention to detail."
                    ]
                },
                {
                    heading: "Educational Background",
                    icon: "🧠",
                    items: [
                        "Bachelor’s degree in Business, Real Estate, Hospitality, or related fields.",
                        "Experience or internships in property management or leasing preferred."
                    ]
                },
                {
                    heading: "Career Path",
                    icon: "📈",
                    items: ["Leasing Coordinator / Operations Coordinator → Leasing Manager / Operations Manager → Property Manager → Asset Manager"]
                },
                {
                    heading: "Key KPIs",
                    icon: "✅",
                    items: [
                        "Lease renewal rates and occupancy levels.",
                        "Timeliness of lease documentation and renewals.",
                        "Tenant satisfaction and issue resolution times.",
                        "Accuracy and completeness of operational reports."
                    ]
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 lg:p-10 font-inter">
            <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 mb-10 border border-gray-100">

                {/* Main Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-800 text-center mb-8 pb-4 border-b-4 border-blue-200 tracking-tight">
                    WORK OF DIFFERENT JOB PROFILES
                </h1>
                <p className="text-lg text-gray-700 mb-10 leading-relaxed text-center max-w-3xl mx-auto">
                    Here’s a detailed overview of the work involved in various job profiles within the Real Estate Investment Trust (REIT) sector in India.
                </p>

                {/* Iterate through each job profile */}
                {jobProfilesData.map((job, jobIndex) => (
                    <section key={job.id} className="mb-12 p-6 bg-blue-50 rounded-xl shadow-lg border-l-8 border-blue-500 transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-6 flex items-center">
                            <span className="text-green-600 text-4xl mr-4">{jobIndex + 1}:</span> {job.title}
                        </h2>
                        <p className="text-base text-gray-700 mb-8 leading-relaxed">
                            {job.intro}
                        </p>

                        {/* Iterate through sections within each job profile */}
                        {job.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="mb-6 last:mb-0">
                                <h3 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
                                    <span className="text-purple-600 text-2xl mr-3">{section.icon}</span> {section.heading}
                                </h3>
                                <ul className="list-none text-gray-700 space-y-2 ml-4">
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start">
                                            <span className="text-blue-500 text-lg mr-2 mt-0.5">▪</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </section>
                ))}

            </div>
        </div>
    );
};

export default JobProfilesWork;
