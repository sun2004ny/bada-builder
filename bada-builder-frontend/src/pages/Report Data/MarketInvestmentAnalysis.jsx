import React from "react";
import "./MarketInvestmentAnalysis.css"; // Link to the CSS file

// Data Arrays for Market Analysis (Macro-Level)
const economicIndicators = [
  { title: "GDP growth", description: "" },
  { title: "Employment rates", description: "" },
  { title: "Inflation & interest rates", description: "" },
  { title: "Consumer spending & sentiment", description: "" },
];

const supplyDemandDynamics = [
  { title: "Vacancy rates", description: "" },
  { title: "Housing starts (new constructions)", description: "" },
  { title: "Population growth & urbanization", description: "" },
  { title: "Migration trends", description: "" },
];

const locationAnalysis = [
  { title: "Infrastructure development", description: "(roads, metro, airports)" },
  { title: "Proximity to commercial hubs, schools, hospitals", description: "" },
  { title: "Zoning regulations and future land use plans", description: "" },
];

const marketTrends = [
  { title: "Property price trends", description: "(YOY/quarterly appreciation)" },
  { title: "Rental yield trends", description: "" },
  { title: "Government policies", description: "(e.g., RERA in India, tax benefits)" },
];

// Data Arrays for Investment Analysis (Micro-Level)
const investmentMetrics = [
  {
    title: "Capitalization Rate (Cap Rate)",
    formula: "Cap Rate = Net Operating Income (NOI) / Property Value",
    description: "Indicates return on investment. Higher is generally better. [cite: 8, 9]",
  },
  {
    title: "Cash-on-Cash Return",
    formula: "Cash-on-Cash Return = Annual Pre-Tax Cash Flow / Total Cash Invested",
    description: "Useful for leveraged investments. [cite: 9]",
  },
  {
    title: "Gross Rental Yield",
    formula: "Rental Yield = (Annual Rental Income / Property Purchase Price) × 100",
    description: "",
  },
  {
    title: "Internal Rate of Return (IRR)",
    description:
      "The discount rate that makes the NPV of all future cash flows (in and out) from a property equal to zero. Helps compare multiple investment options over time. [cite: 11, 12]",
  },
  {
    title: "Net Present Value (NPV)",
    description: "Value of future cash flows discounted to present terms. Positive NPV = profitable investment. [cite: 12, 13]",
  },
  {
    title: "Break-even Ratio",
    description: "Measures how much occupancy is required to cover operating expenses and debt service. [cite: 13, 14]",
  },
];

const dueDiligenceItems = [
  { title: "Legal title & land ownership", description: "" },
  { title: "Zoning & permits", description: "" },
  { title: "Building condition", description: "(for resale/rehab)" },
  { title: "Developer reputation", description: "(for new projects)" },
];

const investmentTypes = [
  { title: "Residential", description: ": Apartments, single-family homes" },
  { title: "Commercial", description: ": Offices, retail spaces, warehouses" },
  { title: "Industrial", description: ": Factories, logistics hubs" },
  { title: "REITs", description: ": Real Estate Investment Trusts" },
  { title: "Crowdfunding Platforms", description: ": Pool investments into larger assets" },
];

const toolsAndPlatforms = [
  { title: "India", description: ": MagicBricks, 99acres, PropTiger, CRE Matrix" },
  { title: "Global", description: ": Zillow, Redfin, LoopNet, Real Capital Analytics" },
  { title: "Data Tools", description: ": Excel, Power BI, Tableau for visualization" },
];

const riskFactors = [
  { title: "Market volatility", description: "" },
  { title: "Liquidity issues", description: "(harder to sell quickly)" },
  { title: "Legal disputes", description: "" },
  { title: "Regulatory changes", description: "" },
  { title: "Natural disasters/climate risk", description: "" },
];

// Bengaluru Market Analysis Data
const bengaluruMarketPerformance = [
  {
    title: "Average Property Prices",
    description:
      "Citywide apartment rates range between ₹8,000–₹10,000 per sq ft. Premium localities like Malleswaram and Jayanagar command higher prices, around ₹11,000–₹13,000 per sq ft. Emerging areas such as Magadi Road and Nagarbhavi are priced between ₹6,000–₹8,000 per sq ft. [cite: 15]",
  },
  {
    title: "Annual Appreciation",
    description:
      "After a significant rebound of 12–15% in 2023–24, property appreciation has stabilized to a sustainable 8%–10% year-on-year, aligning with wage growth in the IT and services sectors. [cite: 15, 16]",
  },
  {
    title: "Sales Volume",
    description:
      "Approximately 30,000 units were sold across Bengaluru in 2024, marking a 5% increase over the previous year. This uptick is driven by end-users and investors seeking rental income. [cite: 16, 17, 18]",
  },
];

const bengaluruSegmentDemand = [
  {
    title: "Mid-Segment Housing",
    description: "Properties priced between ₹40 lakh and ₹1 crore dominate the market, accounting for 60% of total sales. [cite: 18, 19]",
  },
  {
    title: "Luxury & Ultra-Luxury",
    description:
      "The luxury segment (₹2–5 crore) witnessed a 68% surge in sales in 2024, with 9,300 units sold. The ultra-luxury segment (above ₹5 crore) saw a 42% increase in demand compared to 2023. [cite: 19, 20]",
  },
  {
    title: "Affordable Housing",
    description:
      "Units priced below ₹50 lakh constituted 50% of total residential launches. However, the affordable segment's share in total demand fell from 15% in 2023 to 8% in 2024, indicating a significant contraction. [cite: 20, 21, 22]",
  },
];

const investmentHotspots = [
  {
    title: "Whitefield & Sarjapur Road",
    growthDrivers:
      "Enhanced metro connectivity and proximity to IT parks have led to a 20% rise in property values over the past two years in Whitefield. [cite: 23]",
    investmentPotential:
      "These areas are emerging as real estate hotspots due to affordable prices and ongoing infrastructural projects. [cite: 23, 24]",
  },
  {
    title: "Devanahalli",
    strategicImportance:
      "Located near Kempegowda International Airport, Devanahalli has become a prime investment destination. Property prices have appreciated by 18% over the past three years. [cite: 25, 26]",
    infrastructureBoost:
      "The upcoming Bengaluru Suburban Railway and Peripheral Ring Road projects are expected to enhance connectivity and drive real estate investments in this area. [cite: 26, 27]",
  },
  {
    title: "Hoskote",
    connectivityAdvantage:
      "The Bengaluru–Chennai Expressway, with its Karnataka section opened in December 2024, originates in Hoskote. This expressway is expected to reduce travel time between Bengaluru and Chennai to 2–3 hours, fostering growth and development in the region. [cite: 28, 29]",
    investmentProspects:
      "The expressway's development is attracting industrial and real estate investments, making Hoskote a promising area for future growth. [cite: 29, 30]",
  },
];

const infrastructureDevelopments = [
  {
    title: "Namma Metro Expansion",
    description:
      "The Orange Line (ORR-West Line) of Namma Metro, approved in August 2024, is scheduled for completion in 2029. This line will improve connectivity to industrial areas, educational institutions, and healthcare facilities, enhancing last-mile connectivity. [cite: 31]",
  },
  {
    title: "Peripheral Ring Road (PRR)",
    description:
      "Aimed at reducing traffic congestion, the PRR project will unlock new real estate opportunities in areas like Hoskote and Bidadi. [cite: 32]",
  },
  {
    title: "Bengaluru Suburban Railway",
    description:
      "Under construction, this suburban rail network will serve the Bengaluru Metropolitan Region, improving connectivity and potentially boosting property values in connected areas. [cite: 33]",
  },
];

const emergingTrends = [
  {
    title: "Sustainable Living",
    description:
      "Developers are increasingly incorporating green building certifications, energy-efficient designs, and waste management systems. Green-certified buildings now constitute 25% of Bengaluru’s total commercial real estate stock, up from 18% in 2022. [cite: 34]",
  },
  {
    title: "Smart Homes",
    description:
      "Properties equipped with IoT-enabled devices, automated lighting, and AI-driven security systems are seeing a 15% premium in prices. A survey by PropTiger found that 40% of homebuyers in Bengaluru prioritize smart technology integration when purchasing a home. [cite: 35, 36]",
  },
  {
    title: "Community-Centric Living",
    description:
      "Gated communities, integrated townships, and residential complexes with shared amenities are becoming more popular, offering a blend of privacy and social interaction. [cite: 37]",
  },
];

const challengesAndConsiderations = [
  {
    title: "Regulatory Hurdles",
    description:
      "Delays in approvals and ambiguous land acquisition policies continue to pose challenges. The implementation of the Real Estate Regulatory Authority (RERA) has improved transparency but has also increased compliance costs for developers. [cite: 38, 39]",
  },
  {
    title: "Property Tax Hike",
    description:
      "Property owners in Bangalore Development Authority (BDA) layouts are facing a steep property tax hike ranging from 9% to 51% for the fiscal year 2025–26. Residents have expressed dissatisfaction, citing a lack of basic amenities in certain layouts. [cite: 40, 41]",
  },
  {
    title: "Traffic Congestion",
    description:
      "Bengaluru’s notorious traffic congestion remains a deterrent for many homebuyers. The city’s average commute time of 2 hours per day underscores the need for improved urban planning and transportation networks. [cite: 42, 43]",
  },
];

const investmentRecommendations = [
  {
    title: "Mid-Segment Focus",
    description:
      "Investing in mid-segment housing (₹40 lakh to ₹1 crore) in emerging areas like Whitefield and Sarjapur Road offers potential for appreciation, given the ongoing infrastructural developments. [cite: 44]",
  },
  {
    title: "Peripheral Areas",
    description:
      "Areas like Devanahalli and Hoskote are poised for growth due to their strategic locations and upcoming infrastructure projects. Early investments here could yield significant returns. [cite: 45]",
  },
  {
    title: "Smart and Sustainable Homes",
    description:
      "Properties with smart home features and sustainable designs are attracting a premium, indicating a shift in buyer preferences. Investing in such properties could offer better resale value and rental income. [cite: 46]",
  },
];

// Reusable Section Component for lists
const ListSection = ({ title, intro, items, renderItem }) => (
  <section className="list-section">
    <h2>{title}</h2>
    {intro && <p>{intro}</p>}
    <div className="list-grid">
      {items.map((item, index) => (
        <div className="list-item" key={index}>
          {renderItem ? renderItem(item) : (
            <>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              {item.formula && <p><em>Formula:</em> ${item.formula}$</p>} {/* LaTeX for formulas */}
            </>
          )}
        </div>
      ))}
    </div>
  </section>
);

// Main Component for Market and Investment Analysis
const MarketInvestmentAnalysis = () => {
  return (
    <main className="market-investment-analysis-container">
      <h1>Market & Investment Analysis in Real Estate</h1>
      <p>
        Market & Investment Analysis in Real Estate involves evaluating the conditions of the property market and the potential returns and risks associated with specific investments. [cite: 1] This process is critical for making informed decisions and maximizing returns. [cite: 2] Here's a breakdown of how to conduct a comprehensive real estate market and investment analysis: [cite: 3]
      </p>

      <section>
        <h2>🏙️ 1. Market Analysis (Macro-Level)</h2>
        <p>
          Market analysis assesses the broader real estate environment to determine whether it's favourable for investment. [cite: 4]
        </p>
        <ListSection title="✅ Key Components:" items={economicIndicators} renderItem={(item) => (
          <>
            <h3>a. {item.title}</h3>
            <p>{item.description}</p>
          </>
        )} />
        <ListSection title="" items={supplyDemandDynamics} renderItem={(item) => (
          <>
            <h3>b. {item.title}</h3>
            <p>{item.description}</p>
          </>
        )} />
        <ListSection title="" items={locationAnalysis} renderItem={(item) => (
          <>
            <h3>c. {item.title}</h3>
            <p>{item.description}</p>
          </>
        )} />
        <ListSection title="" items={marketTrends} renderItem={(item) => (
          <>
            <h3>d. {item.title}</h3>
            <p>{item.description}</p>
          </>
        )} />
      </section>

      <section>
        <h2>📊 2. Investment Analysis (Micro-Level)</h2>
        <p>This focuses on analyzing a specific property or investment opportunity. [cite: 7]</p>
        <ListSection title="✅ Key Metrics:" items={investmentMetrics} />
      </section>

      <ListSection title="🔍 3. Due Diligence" intro="Before investing, assess: [cite: 14]" items={dueDiligenceItems} />

      <ListSection title="💡 4. Types of Real Estate Investments" items={investmentTypes} />

      <ListSection title="📈 5. Tools & Platforms" items={toolsAndPlatforms} />

      <ListSection title="🧠 6. Risk Factors" items={riskFactors} />

      <section className="bengaluru-analysis-section">
        <h2>Analysis of Bengaluru Market:</h2>
        <p>Certainly! Here's a comprehensive analysis of Bengaluru's real estate market in 2025, encompassing current trends, investment hotspots, and key considerations for prospective investors: [cite: 15]</p>

        <h2>🏙️ Bengaluru Real Estate Market Overview (2025)</h2>
        <ListSection title="📈 Market Performance & Pricing" items={bengaluruMarketPerformance} />
        <ListSection title="🏘️ Segment-Wise Demand" items={bengaluruSegmentDemand} />
      </section>

      <section>
        <h2>📍 Investment Hotspots in Bengaluru</h2>
        <div className="hotspots-grid">
          {investmentHotspots.map((hotspot, index) => (
            <div className="hotspot-item" key={index}>
              <h3>{hotspot.title}</h3>
              {hotspot.growthDrivers && <p><strong>Growth Drivers:</strong> {hotspot.growthDrivers}</p>}
              {hotspot.investmentPotential && <p><strong>Investment Potential:</strong> {hotspot.investmentPotential}</p>}
              {hotspot.strategicImportance && <p><strong>Strategic Importance:</strong> {hotspot.strategicImportance}</p>}
              {hotspot.infrastructureBoost && <p><strong>Infrastructure Boost:</strong> {hotspot.infrastructureBoost}</p>}
              {hotspot.connectivityAdvantage && <p><strong>Connectivity Advantage:</strong> {hotspot.connectivityAdvantage}</p>}
              {hotspot.investmentProspects && <p><strong>Investment Prospects:</strong> {hotspot.investmentProspects}</p>}
            </div>
          ))}
        </div>
      </section>

      <ListSection title="🛠️ Infrastructure Developments Impacting Real Estate" items={infrastructureDevelopments} />

      <ListSection title="🌱 Emerging Trends in Bengaluru's Real Estate" items={emergingTrends} />

      <ListSection title="⚠️ Challenges and Considerations" items={challengesAndConsiderations} />

      <ListSection title="💡 Investment Recommendations" items={investmentRecommendations} />

      {/* Placeholder for a flow diagram image if needed in the future */}
      {/* <section>
        <h1> Flow Diagram</h1>
        <img src={FlowDiagramImage} alt="Flow Diagram of Market and Investment Analysis" />
      </section> */}
    </main>
  );
};

export default MarketInvestmentAnalysis;