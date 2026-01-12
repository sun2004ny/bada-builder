// import React from "react";
// import lamImage from "../../assets/pages/LAM.png";
// import "./LAM.css";

// const LAM = () => {
//   return (
//     <main className="lam-container">
//       <h1>LEASE AND ASSET MANAGEMENT</h1>

//       <p>
//         <strong>"Lease & Asset Management"</strong> refers to the strategic oversight and
//         administration of leased properties and physical assets—typically within
//         real estate, corporate real estate portfolios, or infrastructure-heavy industries.
//         Here’s a quick breakdown of what each part entails:
//       </p>

//       <section>
//         <h2>1. Lease Management</h2>
//         <p>This involves overseeing all aspects of lease agreements. Key responsibilities include:</p>
//         <ul>
//           <li><strong>Lease Administration:</strong> Maintaining a database of all lease contracts, ensuring key dates (renewals, expirations, rent reviews) are tracked.</li>
//           <li><strong>Rent Collection & Payment Monitoring:</strong> Ensuring tenants pay rent on time or landlords receive payments.</li>
//           <li><strong>Compliance:</strong> Ensuring adherence to legal terms in the lease and local property laws.</li>
//           <li><strong>Reporting:</strong> Providing financial and operational lease performance metrics.</li>
//           <li><strong>Renewals & Negotiations:</strong> Managing lease extensions, renegotiations, or terminations.</li>
//           <li><strong>Tenant Relationship Management:</strong> Maintaining communication and resolving disputes.</li>
//         </ul>
//       </section>

//       <section>
//         <h2>2. Asset Management</h2>
//         <p>This refers to the broader strategy of maximizing the value and performance of physical real estate assets. It includes:</p>
//         <ul>
//           <li><strong>Portfolio Strategy:</strong> Managing an entire portfolio to meet investment goals (e.g., diversification, income generation, capital appreciation).</li>
//           <li><strong>Operational Optimization:</strong> Improving efficiency, reducing costs (maintenance, utilities), and enhancing tenant satisfaction.</li>
//           <li><strong>Capital Improvements:</strong> Managing renovations or upgrades that increase asset value.</li>
//           <li><strong>Valuation & ROI Analysis:</strong> Regularly assessing asset performance and calculating returns.</li>
//           <li><strong>Disposition Strategy:</strong> Deciding when and how to sell or repurpose assets.</li>
//         </ul>
//       </section>

//       <section>
//         <h2>Combined Role: Lease & Asset Management in Practice</h2>
//         <p>In many companies (especially REITs or real estate investment firms), these two functions are integrated to:</p>
//         <ul>
//           <li>Streamline operations</li>
//           <li>Improve cash flow</li>
//           <li>Maximize asset value</li>
//           <li>Ensure legal compliance</li>
//         </ul>
//       </section>

//       <section>
//         <h2>Tools Used</h2>
//         <ul>
//           <li><strong>ERP/CRM Software:</strong> SAP, Oracle, Yardi, MRI Software</li>
//           <li><strong>Lease Accounting Platforms:</strong> LeaseQuery, Visual Lease, CoStar</li>
//           <li><strong>Custom Dashboards:</strong> Built on tools like Power BI or Tableau for performance insights</li>
//         </ul>
//       </section>

//       <section>
//         <h2>🧭 Lease & Asset Management Workflow System</h2>
//         <p>Here's a comprehensive Lease & Asset Management Workflow System—ideal for real estate investment firms, REITs, or property managers. This workflow can be implemented manually, through software, or as part of a custom-built platform.</p>

//         <h3>1. Asset Acquisition & Onboarding</h3>
//         <p><strong>Objective:</strong> Bring a new asset (property/unit) into the management system.</p>
//         <ul>
//           <li>Conduct due diligence (title, zoning, legal clearances)</li>
//           <li>Perform initial asset valuation</li>
//           <li>Register asset in asset management system</li>
//           <li>Upload all related documents (blueprints, permits, contracts)</li>
//           <li>Tag asset with metadata (location, size, use type, owner, purchase date)</li>
//         </ul>

//         <h3>2. Lease Lifecycle Management</h3>

//         <strong>A. Lease Creation</strong>
//         <ul>
//           <li>Draft lease agreement (legal, financial, operational terms)</li>
//           <li>Digitally review and sign by all parties</li>
//           <li>Store lease in document repository</li>
//           <li>Set up automated reminders for key dates</li>
//         </ul>

//         <strong>B. Lease Administration</strong>
//         <ul>
//           <li>Track rent amounts, due dates, escalation clauses</li>
//           <li>Monitor common area maintenance (CAM) charges</li>
//           <li>Automatically generate monthly invoices</li>
//           <li>Integrate with accounting/payments system</li>
//         </ul>

//         <strong>C. Lease Modifications</strong>
//         <ul>
//           <li>Handle renewals, terminations, or amendments</li>
//           <li>Record updated lease versions with version history</li>
//           <li>Notify finance and legal departments of changes</li>
//         </ul>

//         <strong>D. Lease Expiry or Termination</strong>
//         <ul>
//           <li>Alert stakeholders 90/60/30 days in advance</li>
//           <li>Negotiate renewal or plan for exit</li>
//           <li>Perform exit inspection and issue clearance letter</li>
//           <li>Archive lease and update asset availability</li>
//         </ul>

//         <h3>3. Asset Performance Management</h3>
//         <p><strong>Objective:</strong> Maximize asset value, revenue, and tenant satisfaction.</p>
//         <ul>
//           <li>Monitor rental income vs. market value</li>
//           <li>Track occupancy/vacancy rates</li>
//           <li>Schedule regular maintenance & inspections</li>
//           <li>Track asset-level KPIs (NOI, cap rate, IRR)</li>
//           <li>Approve capital expenditures (e.g., renovations)</li>
//           <li>Run risk assessments (fire, insurance, structural health)</li>
//         </ul>

//         <h3>4. Financial Management & Reporting</h3>
//         <p><strong>Objective:</strong> Ensure financial compliance and investor reporting.</p>
//         <ul>
//           <li>Generate monthly/quarterly reports: revenue, expenses, net income</li>
//           <li>Track lease receivables and collections</li>
//           <li>Perform lease accounting (ASC 842/IFRS 16 compliant)</li>
//           <li>Audit asset depreciation schedules</li>
//           <li>Forecast future cash flows and asset ROI</li>
//         </ul>

//         <h3>5. Compliance & Document Control</h3>
//         <p><strong>Objective:</strong> Avoid legal and regulatory risks.</p>
//         <ul>
//           <li>Auto-validate lease clauses with local real estate law</li>
//           <li>Track insurance certificates, licenses, permits</li>
//           <li>Enable access control for sensitive files</li>
//           <li>Implement audit trail logging for changes</li>
//         </ul>

//         <h3>6. Communication & Notifications</h3>
//         <p><strong>Objective:</strong> Keep all stakeholders updated.</p>
//         <ul>
//           <li>Notify tenants of lease events (due payments, inspections)</li>
//           <li>Notify asset managers of expirations, low occupancy</li>
//           <li>Notify finance team of delinquent leases</li>
//           <li>Schedule quarterly review meetings with stakeholders</li>
//         </ul>

//         <h3>7. Disposition or Exit Strategy</h3>
//         <p><strong>Objective:</strong> Plan and execute property sale or repositioning.</p>
//         <ul>
//           <li>Perform current market valuation</li>
//           <li>Prepare asset for sale (legal, financial, and operational audits)</li>
//           <li>Launch listing or offer to institutional buyers</li>
//           <li>Offboard from system upon sale</li>
//         </ul>
//       </section>

//       <section>
//         <h2>✅ Optional Features / Enhancements</h2>
//         <ul>
//           <li><strong>Tenant Portal:</strong> For rent payments, complaints, documents</li>
//           <li><strong>Mobile App:</strong> For field agents, inspections, or maintenance logs</li>
//           <li><strong>AI Engine:</strong> Predictive maintenance, lease churn prediction</li>
//           <li><strong>Custom Dashboards:</strong> Power BI or Tableau integration for analytics</li>
//         </ul>
//       </section>

//       <img src={lamImage} alt="L&A flow diagram" />
//     </main>
//   );
// };

// export default LAM;

// ----------------------------------------
// import React from "react";
// import "./LAM.css";

// const leaseManagementPoints = [
//   {
//     title: "Lease Administration",
//     description: "Maintaining a database of all lease contracts, ensuring key dates (renewals, expirations, rent reviews) are tracked.",
//   },
//   {
//     title: "Rent Collection & Payment Monitoring",
//     description: "Ensuring tenants pay rent on time or landlords receive payments.",
//   },
//   {
//     title: "Compliance",
//     description: "Ensuring adherence to legal terms in the lease and local property laws.",
//   },
//   {
//     title: "Reporting",
//     description: "Providing financial and operational lease performance metrics.",
//   },
//   {
//     title: "Renewals & Negotiations",
//     description: "Managing lease extensions, renegotiations, or terminations.",
//   },
//   {
//     title: "Tenant Relationship Management",
//     description: "Maintaining communication and resolving disputes.",
//   },
// ];

// const LAM = () => {
//   return (
//     <main className="lam-container">
//       <h1>1. Lease Management</h1>
//       <p>This involves overseeing all aspects of lease agreements. Key responsibilities include:</p>

//       <div className="card-grid">
//         {leaseManagementPoints.map((point, index) => (
//           <div className="card" key={index}>
//             <h3>{point.title}</h3>
//             <p>{point.description}</p>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// };

// export default LAM;

// ---------------------------------

import React from "react";
import LAmimage from '../../assets/pages/LAM.png';
import "./LAM.css"; // Removed this import as CSS is now embedded

// Data Arrays
const leaseManagementPoints = [
  { title: "Lease Administration", description: "Maintaining a database of all lease contracts, ensuring key dates (renewals, expirations, rent reviews) are tracked." },
  { title: "Rent Collection & Payment Monitoring", description: "Ensuring tenants pay rent on time or landlords receive payments." },
  { title: "Compliance", description: "Ensuring adherence to legal terms in the lease and local property laws." },
  { title: "Reporting", description: "Providing financial and operational lease performance metrics." },
  { title: "Renewals & Negotiations", description: "Managing lease extensions, renegotiations, or terminations." },
  { title: "Tenant Relationship Management", description: "Maintaining communication and resolving disputes." },
];

const assetManagementPoints = [
  { title: "Portfolio Strategy", description: "Managing an entire portfolio to meet investment goals (e.g., diversification, income generation, capital appreciation)." },
  { title: "Operational Optimization", description: "Improving efficiency, reducing costs (maintenance, utilities), and enhancing tenant satisfaction." },
  { title: "Capital Improvements", description: "Managing renovations or upgrades that increase asset value." },
  { title: "Valuation & ROI Analysis", description: "Regularly assessing asset performance and calculating returns." },
  { title: "Disposition Strategy", description: "Deciding when and how to sell or repurpose assets." },
];

const combinedRolePoints = [
  { title: "Streamline operations", description: "Integrating lease and asset management functions for operational efficiency." },
  { title: "Improve cash flow", description: "Better lease monitoring and optimized asset utilization increases revenue consistency." },
  { title: "Maximize asset value", description: "Through capital improvements, performance monitoring, and strategic disposition." },
  { title: "Ensure legal compliance", description: "Centralized oversight supports adherence to laws and lease terms." },
];

const toolsUsedPoints = [
  { title: "ERP/CRM Software", description: "SAP, Oracle, Yardi, MRI Software" },
  { title: "Lease Accounting Platforms", description: "LeaseQuery, Visual Lease, CoStar" },
  { title: "Custom Dashboards", description: "Built on tools like Power BI or Tableau for performance insights" },
];

const optionalFeaturesPoints = [
  { title: "Tenant Portal", description: "For rent payments, complaints, documents" },
  { title: "Mobile App", description: "For field agents, inspections, or maintenance logs" },
  { title: "AI Engine", description: "Predictive maintenance, lease churn prediction" },
  { title: "Custom Dashboards", description: "Power BI or Tableau integration for analytics" },
];

const workflowSteps = [
  {
    section: "1. Asset Acquisition & Onboarding",
    objective: "Bring a new asset (property/unit) into the management system.",
    steps: [
      "Conduct due diligence (title, zoning, legal clearances)",
      "Perform initial asset valuation",
      "Register asset in asset management system",
      "Upload all related documents (blueprints, permits, contracts)",
      "Tag asset with metadata (location, size, use type, owner, purchase date)"
    ]
  },
  {
    section: "2. Lease Lifecycle Management - A. Lease Creation",
    steps: [
      "Draft lease agreement (legal, financial, operational terms)",
      "Digitally review and sign by all parties",
      "Store lease in document repository",
      "Set up automated reminders for key dates"
    ]
  },
  {
    section: "2. Lease Lifecycle Management - B. Lease Administration",
    steps: [
      "Track rent amounts, due dates, escalation clauses",
      "Monitor common area maintenance (CAM) charges",
      "Automatically generate monthly invoices",
      "Integrate with accounting/payments system"
    ]
  },
  {
    section: "2. Lease Lifecycle Management - C. Lease Modifications",
    steps: [
      "Handle renewals, terminations, or amendments",
      "Record updated lease versions with version history",
      "Notify finance and legal departments of changes"
    ]
  },
  {
    section: "2. Lease Lifecycle Management - D. Lease Expiry or Termination",
    steps: [
      "Alert stakeholders 90/60/30 days in advance",
      "Negotiate renewal or plan for exit",
      "Perform exit inspection and issue clearance letter",
      "Archive lease and update asset availability"
    ]
  },
  {
    section: "3. Asset Performance Management",
    objective: "Maximize asset value, revenue, and tenant satisfaction.",
    steps: [
      "Monitor rental income vs. market value",
      "Track occupancy/vacancy rates",
      "Schedule regular maintenance & inspections",
      "Track asset-level KPIs (NOI, cap rate, IRR)",
      "Approve capital expenditures (e.g., renovations)",
      "Run risk assessments (fire, insurance, structural health)"
    ]
  },
  {
    section: "4. Financial Management & Reporting",
    objective: "Ensure financial compliance and investor reporting.",
    steps: [
      "Generate monthly/quarterly reports: revenue, expenses, net income",
      "Track lease receivables and collections",
      "Perform lease accounting (ASC 842/IFRS 16 compliant)",
      "Audit asset depreciation schedules",
      "Forecast future cash flows and asset ROI"
    ]
  },
  {
    section: "5. Compliance & Document Control",
    objective: "Avoid legal and regulatory risks.",
    steps: [
      "Auto-validate lease clauses with local real estate law",
      "Track insurance certificates, licenses, permits",
      "Enable access control for sensitive files",
      "Implement audit trail logging for changes"
    ]
  },
  {
    section: "6. Communication & Notifications",
    objective: "Keep all stakeholders updated.",
    steps: [
      "Notify tenants of lease events (due payments, inspections)",
      "Notify asset managers of expirations, low occupancy",
      "Notify finance team of delinquent leases",
      "Schedule quarterly review meetings with stakeholders"
    ]
  },
  {
    section: "7. Disposition or Exit Strategy",
    objective: "Plan and execute property sale or repositioning.",
    steps: [
      "Perform current market valuation",
      "Prepare asset for sale (legal, financial, and operational audits)",
      "Launch listing or offer to institutional buyers",
      "Offboard from system upon sale"
    ]
  }
];

// Reusable Card Group
const CardSection = ({ title, points }) => (
  <section>
    <h2>{title}</h2>
    <div className="card-grid">
      {points.map((point, index) => (
        <div className="card" key={index}>
          <h3>{point.title}</h3>
          <p>{point.description}</p>
        </div>
      ))}
    </div>
  </section>
);

// Main Component
const LAM = () => {
  return (
    <main className="lam-container">
      {/* Embedded CSS */}
     

      <h1>Lease & Asset Management</h1>
      <p>
        "Lease & Asset Management" refers to the strategic oversight and administration of leased properties and physical assets—typically within real estate, corporate portfolios, or infrastructure-heavy industries.
      </p>

      <CardSection title="1. Lease Management" points={leaseManagementPoints} />
      <CardSection title="2. Asset Management" points={assetManagementPoints} />
      <CardSection title="Combined Role in Practice" points={combinedRolePoints} />
      <CardSection title="Tools Used" points={toolsUsedPoints} />
      <CardSection title="✅ Optional Features / Enhancements" points={optionalFeaturesPoints} />

      <section>
        <h2>🧭 Lease & Asset Management Workflow System</h2>
        {/* The workflow-grid-container now wraps only the mapped workflow sections */}
        <div className="workflow-grid-container">
          {workflowSteps.map((flow, idx) => (
            <div key={idx} className="workflow-section">
              <h3>{flow.section}</h3>
              {flow.objective && <p><strong>Objective:</strong> {flow.objective}</p>}
              <ul className="workflow-list">
                {flow.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h1> Flow Diagram</h1>
        <img src={LAmimage} alt="" />
      </section>
    </main>
  );
};

export default LAM;
