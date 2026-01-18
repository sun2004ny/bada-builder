import React from "react";
import "./RealEstateFinancialModelling.css";

// Data for Example Property
const exampleProperty = {
  purchasePrice: "₹1,00,00,000",
  rentIncomePerYear: "₹10,00,000 (increasing 5% per year)",
  operatingCosts: "₹2,00,000 per year (fixed)",
  holdingPeriod: "5 years",
  salePriceYear5: "₹1,25,00,000",
  discountRate: "12%",
};

// Data for DCF Cash Flows
const dcfCashFlows = [
  { year: "0", netCashFlow: "-₹1,00,00,000 (purchase)" },
  { year: "1", netCashFlow: "₹8,00,000 (₹10,00,000 - ₹2,00,000)" },
  { year: "2", netCashFlow: "₹8,50,000" },
  { year: "3", netCashFlow: "₹8,92,500" },
  { year: "4", netCashFlow: "₹9,37,125" },
  { year: "5", netCashFlow: "₹9,83,981 + ₹1,25,00,000 (sale) = ₹1,34,83,981" },
];

// Reusable Section Component for lists/items
const SectionBlock = ({ title, children }) => (
  <section className="section-block">
    {title && <h2>{title}</h2>}
    {children}
  </section>
);

const RealEstateFinancialModelling = () => {
  return (
    <main className="refm-container">
      <h1>Real Estate Financial Modelling</h1>
      <p>
        Real estate financial modeling helps investors evaluate the financial viability of a real estate investment. The three most common tools are: DCF (Discounted Cash Flow), IRR (Internal Rate of Return), and NPV (Net Present Value). Let's break each one down with a simple example.
      </p>

      <SectionBlock title="🏠 Example Property">
        <ul className="example-property-list">
          <li><strong>Purchase Price:</strong> {exampleProperty.purchasePrice}</li>
          <li><strong>Rent Income per year:</strong> {exampleProperty.rentIncomePerYear}</li>
          <li><strong>Operating Costs:</strong> {exampleProperty.operatingCosts}</li>
          <li><strong>Holding Period:</strong> {exampleProperty.holdingPeriod}</li>
          <li><strong>Sale Price in Year 5:</strong> {exampleProperty.salePriceYear5}</li>
          <li><strong>Discount Rate:</strong> {exampleProperty.discountRate}</li>
        </ul>
      </SectionBlock>

      <SectionBlock title="🧮 DCF – Discounted Cash Flow">
        <p>
          DCF estimates the value of an investment based on its future cash flows, discounted to today's value.
        </p>
        <h3>📊 Cash Flows:</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Net Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {dcfCashFlows.map((row, index) => (
                <tr key={index}>
                  <td>{row.year}</td>
                  <td>{row.netCashFlow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Now, discount each year’s cash flow using the {exampleProperty.discountRate} discount rate:
        </p>
        <p className="formula">
          Discounted Cash Flow = Cash Flow $\div$ (1 + r)$^n$
          <br />
          Where r = {exampleProperty.discountRate}, n = year
        </p>
        <p>
          Then sum all discounted values to get the Net Present Value.
        </p>
      </SectionBlock>

      <SectionBlock title="📈 IRR – Internal Rate of Return">
        <p>
          IRR is the rate (r) at which NPV = 0. It's the break-even interest rate of the investment.
        </p>
        <p>To find IRR, solve:</p>
        <p className="formula">
          0 = -₹1,00,00,000 + ₹8,00,000/(1+r)¹ + ₹8,50,000/(1+r)² + … + ₹1,34,83,981/(1+r)⁵
        </p>
        <p>
          You’d typically use Excel, a calculator, or Python for this.
        </p>
        <p>In Excel:</p>
        <pre className="excel-code">
          <code>
            =IRR(values)
            <br />
            =IRR (&#123;-10000000, 800000, 850000, 892500, 937125, 13483981&#125;) → returns approx.
            <br />
            18.6%
          </code>
        </pre>
      </SectionBlock>

      <SectionBlock title="💰 NPV – Net Present Value">
        <p>
          NPV is the total present value of future cash flows minus the initial investment.
        </p>
        <p>In Excel:</p>
        <pre className="excel-code">
          <code>
            =NPV(12%, values from Year 1 to Year 5) - ₹1,00,00,000
            <br />
            = NPV(12%, &#123;800000, 850000, 892500, 937125, 13483981&#125;) - 10000000
            <br />
            → Returns approx. ₹8,65,000 (positive → good investment)
          </code>
        </pre>
      </SectionBlock>

      <SectionBlock title="📌 Summary">
        <ul className="summary-list">
          <li>DCF shows today's value of future income.</li>
          <li>IRR tells you the rate of return.</li>
          <li>NPV tells you the profit in today's money.</li>
        </ul>
      </SectionBlock>
    </main>
  );
};

export default RealEstateFinancialModelling;