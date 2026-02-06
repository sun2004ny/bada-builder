import React from 'react';
import { FaVideo, FaHelicopter, FaBullhorn, FaUserTie, FaHandshake, FaCheckCircle } from 'react-icons/fa';

export const packages = [
    {
        id: 1,
        title: "Only Shoot (DSLR)",
        target: "Individuals & Developers & Interior Designer & Architecture",
        icon: <FaVideo size={24} />,
        videos: "2 Videos (3 mins each)",
        price: "₹7,000",
        priceSub: "Flat fee",
        features: [
            "Professional DSLR Shoot",
            "Video Editing & Color Grading",
            "YouTube/Instagram Optimized Output"
        ],
        payment: "100% after shoot (Online)",
        popular: false
    },
    {
        id: 2,
        title: "Only Shoot (DSLR + Drone)",
        target: "Individuals & Developers & Architecture",
        icon: <FaHelicopter size={24} />,
        videos: "3 Videos (3 mins each)",
        price: "₹25,000",
        priceSub: "Flat fee",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage"
        ],
        payment: "100% after shoot (Online)",
        popular: true
    },
    {
        id: 3,
        title: "Shoot (DSLR + Drone) + Digital Marketing",
        target: "Individuals & Developers & Architecture",
        icon: <FaBullhorn size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "1%",
        priceSub: "of property price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach"
        ],
        payment: "Online: 20% brokerage upfront + 80% after sale. Offline: 20% before sale + 80% after sale.",
        popular: false
    },
    {
        id: 4,
        title: "Influencer Marketing",
        target: "Individuals & Developers",
        icon: <FaUserTie size={24} />,
        videos: "5 Videos (3 mins each)",
        price: "2%",
        priceSub: "of property price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates"
        ],
        payment: "Online: 20% brokerage upfront + 80% after sale. Offline: 20% before sale + 80% after sale.",
        popular: true
    },
    {
        id: 5,
        title: "Sole Selling + Marketing Agent",
        target: "Developers Only",
        icon: <FaHandshake size={24} />,
        videos: "Unlimited Video Content",
        price: "4%",
        priceSub: "of project price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates",
            "Exclusive Selling Rights",
            "Dedicated Real Estate Agent",
            "On-desk Enquiry Handling",
            "Possession & Record Maintenance"
        ],
        payment: "Payment starts after selling properties (from buyer collections)",
        popular: false
    },
    {
        id: 6,
        title: "Sole Selling + RISG ",
        target: "Developers Only",
        icon: <FaCheckCircle size={24} />,
        videos: "Unlimited Video Content",
        price: "8%",
        priceSub: "of project price",
        features: [
            "Professional Aerial Drone Shots",
            "DSLR Interior Walkthrough",
            "Premium Editing & Transitions",
            "Complete Property Coverage",
            "Meta Ads (FB & Insta) Setup",
            "Lead Generation Campaigns",
            "Targeted Audience Reach",
            "Real Estate Influencer Promotion",
            "Brand Building & Trust",
            "Higher Engagement Rates",
            "Exclusive Selling Rights",
            "Dedicated Real Estate Agent",
            "On-desk Enquiry Handling",
            "Possession & Record Maintenance",
            "RISG: Rental Income Substitution Guarantee",
            "Upfront Monthly Rental till Sale",
            "Guaranteed Cash Flow",
            "Unlimited Marketing Assets"
        ],
        payment: "Payment starts after selling properties (from buyer collections)",
        popular: true
    }
];
