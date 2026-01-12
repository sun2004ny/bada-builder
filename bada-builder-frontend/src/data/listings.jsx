import gracewood1 from '../assets/images/gracewood/gracewood1.jpg';
import gracewood2 from '../assets/images/gracewood/gracewood2.jpg';
import gracewood3 from '../assets/images/gracewood/gracewood3.jpg';
import gracewoodplan1 from '../assets/images/gracewood/gracewoodplan1.jpg';
import gracewoodplan2 from '../assets/images/gracewood/gracewoodplan2.jpg';
import gracewoodplan3 from '../assets/images/gracewood/gracewoodplan3.jpg';

const listings = [
  {
    id: 1,
    title: "Gracewood Elegance",
    type: "Independent House/Villa",
    image: gracewood1, // main image
    images: [gracewood1, gracewood2, gracewood3],
    location: "Bill, Vadodara",
    priceRange: "88 L - 1.27 Cr",
    tags: ["RERA ✅","Under Construction"],
    floorPlans: [
      {
        size: 1638,
        price: "88 L",
        image: gracewoodplan1,
      },
      {
        size: 1644,
        price: "88 L",
        image: gracewoodplan2,
      },
      {
        size: 1786,
        price: "1.27 Cr",
        image: gracewoodplan3,
      },
    ],
    facilities: [
      "Swimming Pool",
      "Gymnasium",
      "Children's Play Area",
      "Landscape Garden",
      "Banquet Hall",
      "Amphitheatre"
    ],
    advantages: [
      { place: "Photon School I", distance: "11.6 Km" },
      { place: "Jupiter Hospital", distance: "4.8 Km" },
      { place: "Navrachana School", distance: "6.3 Km" }
    ],
    description: `Gracewood Elegance in Bill, Vadodara is an under-construction project offering 4 BHK villas. These homes feature modern design, top amenities, and are scheduled for possession by Dec 2025. Ideal for buyers seeking luxury and location.`
  },
  {
    id: 2,
    title: "Narayan Orbis Phase 2",
    type: "Flat/Apartment",
    image: "/sample-flat.jpg",
    images: [
      "/sample-flat.jpg",
      "/floorplans/flat1.jpg",
      "/floorplans/flat2.jpg"
    ],
    location: "Atladara, Vadodara",
    priceRange: "₹16,500/month + ₹18,000 Deposit",
    tags: ["Ready to move"],
    floorPlans: [
      {
        size: 2600,
        price: "₹16,500/month",
        image: "/floorplans/flat1.jpg",
      }
    ],
    facilities: [
      "24x7 Security",
      "Lift",
      "Power Backup",
      "Parking",
      "Children's Play Area"
    ],
    advantages: [
      { place: "Reliance Mall", distance: "3.2 Km" },
      { place: "Sun Hospital", distance: "2.0 Km" }
    ],
    description: `Narayan Orbis Phase 2 offers spacious 4 BHK apartments in Atladara, Vadodara. Ideal for families, with modern amenities and close access to hospitals and malls.`
  }
];

export default listings;