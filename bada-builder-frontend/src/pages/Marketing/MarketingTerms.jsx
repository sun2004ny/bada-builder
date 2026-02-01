import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MarketingTerms.css';

const MarketingTerms = () => {
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const sections = [
        {
            id: 1,
            title: "1. Service Scope",
            content: `Bada Builder provides:
• Property videography & photography (DSLR / Drone)
• Video editing & ad creatives
• Digital marketing via Meta Ads (Facebook & Instagram)
• Influencer promotions
• Lead generation & CRM support
• Sole selling & real estate desk handling
• RISG (Rental Income Substitution Guarantee – only in Package 6)

Service scope varies based on the package selected.`
        },
        {
            id: 2,
            title: "2. Eligibility",
            content: `Package 1-4: Individual Property Owners & Developers
Package 5-6: Developers Only

Client must be the legal owner or authorized representative of the property.`
        },
        {
            id: 3,
            title: "3. Payment Terms",
            content: `Fixed Price Packages:

Package 1 & 2: 100% after shoot (online)
Package 3 & 4: 20% of brokerage upfront + 80% after sale
Package 5 & 6: Payment starts only after property sale, from buyer collections

All prices are exclusive of GST (if applicable).`
        },
        {
            id: 4,
            title: "4. Brokerage Calculation",
            content: `Package 3: 1% of property price
Package 4: 2% of property price
Package 5: 4% of total project value
Package 6: 8% of total project value

Property value is the final agreed selling price.`
        },
        {
            id: 5,
            title: "5. Online Payment Policy (Only for Individuals)",
            content: `For Packages 3 & 4:
• Client must enter correct property value
• Pay 20% of brokerage online
• Remaining 80% payable after sale

False price declaration will result in service termination.`
        },
        {
            id: 6,
            title: "6. Content Ownership",
            content: `All videos, images, creatives, ads & reels:
• Remain the property of Bada Builder
• May be used for branding, portfolio & advertising
• Cannot be resold or reused by client without permission`
        },
        {
            id: 7,
            title: "7. Drone & Shoot Disclaimer",
            content: `Drone shooting is subject to:
• Government permissions
• Local restrictions
• Weather conditions

If drone use is denied, DSLR-only shoot will be done with no refund.`
        },
        {
            id: 8,
            title: "8. Lead Generation Disclaimer",
            content: `Bada Builder does not guarantee sales.

We guarantee:
• Professional marketing
• Lead generation
• Sales support

Final sale depends on:
• Property pricing
• Location
• Market demand
• Legal clearances`
        },
        {
            id: 9,
            title: "9. Influencer Marketing Disclaimer",
            content: `Influencer selection is:
• Based on availability
• Audience relevance
• Budget suitability

Follower count does not guarantee sales.`
        },
        {
            id: 10,
            title: "10. Sole Selling Agreement (Packages 5 & 6)",
            content: `Developer must:
• Give exclusive selling rights
• Not sell independently or via third parties
• Share updated inventory regularly

Violation = Immediate contract termination + penalty equal to full brokerage.`
        },
        {
            id: 11,
            title: "11. RISG – Rental Income Substitution Guarantee (Package 6 Only)",
            content: `Applicable only to:
• Residential properties
• After project completion
• Until property is sold

Conditions:
• Rental value is pre-agreed
• Paid monthly
• Stops immediately after sale
• Not applicable for land or commercial projects

Bada Builder reserves the right to withdraw RISG if:
• Developer misrepresents inventory
• Legal issues arise
• Project is delayed beyond agreed timeline`
        },
        {
            id: 12,
            title: "12. Cancellation & Refund",
            content: `Shoot already done: No refund
Digital marketing started: No refund
Contract breach by client: No refund
Bada Builder unable to deliver: Pro-rata refund`
        },
        {
            id: 13,
            title: "13. Legal Compliance",
            content: `Client is responsible for:
• Title documents
• RERA approvals
• Local permissions
• Tax compliance

Bada Builder is not liable for legal disputes.`
        },
        {
            id: 14,
            title: "14. Limitation of Liability",
            content: `Bada Builder is not responsible for:
• Buyer defaults
• Market fluctuations
• Government policy changes
• Force majeure events`
        },
        {
            id: 15,
            title: "15. Governing Law",
            content: `This Agreement is governed by the laws of India.
Jurisdiction: Vadodara, Gujarat.`
        }
    ];

    return (
        <div className="marketing-terms-page">
            <div className="terms-header">
                <button className="back-btn" onClick={() => navigate('/services/marketing')}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Terms & Conditions</h1>
                <p className="terms-subtitle">Marketing, Videography & RISG Services Agreement</p>
            </div>

            <div className="terms-intro">
                <p>
                    These Terms & Conditions ("Agreement") govern the marketing, videography, digital advertising, 
                    sole selling, influencer marketing, and RISG (Rental Income Substitution Guarantee) services 
                    provided by <strong>Bada Builder</strong> ("Company", "We", "Us") to the Client ("You").
                </p>
                <p className="terms-highlight">
                    By booking any package, you agree to the terms below.
                </p>
            </div>

            <div className="terms-sections">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        className={`terms-section ${openSection === section.id ? 'active' : ''}`}
                    >
                        <div 
                            className="terms-section-header"
                            onClick={() => toggleSection(section.id)}
                        >
                            <h3>{section.title}</h3>
                            {openSection === section.id ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                        
                        {openSection === section.id && (
                            <div className="terms-section-content">
                                <pre>{section.content}</pre>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="terms-footer">
                <p>Last Updated: February 2026</p>
                <p>For questions or clarifications, contact: <a href="mailto:1001_nakul@badabuilder.com">1001_nakul@badabuilder.com</a></p>
            </div>
        </div>
    );
};

export default MarketingTerms;
