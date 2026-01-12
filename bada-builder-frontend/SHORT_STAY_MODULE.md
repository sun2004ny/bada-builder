# Short Stay Module - Bada Builder

## Overview
Short Stay is a new business vertical for Bada Builder that allows property owners to list properties for short-term rentals (similar to Airbnb) and users to discover, book, and pay for stays.

## Features

### 1. Short Stay Landing Page
- **Route**: `/short-stay`
- Hero section with search (Location, Check-in, Check-out, Guests)
- Property categories (Apartments, Villas, Houses, etc.)
- Featured listings
- CTA buttons for exploring and listing properties

### 2. Property Listing (Host Side)
- **Route**: `/short-stay/list-property`
- Comprehensive form for property details
- Image gallery upload
- Availability calendar
- Pricing configuration

### 3. Property Details Page
- **Route**: `/short-stay/:id`
- Image slider
- Full property information
- Amenities and house rules
- Availability calendar
- Booking widget

### 4. Booking System
- Date selection with availability check
- Price calculation (nights × price + fees)
- Guest details form
- Payment integration (Razorpay)
- Booking confirmation

### 5. User Dashboard Integration
- My Short Stays (host view)
- My Bookings (guest view)
- Booking history
- Upcoming stays

### 6. Host Dashboard
- **Route**: `/short-stay/host-dashboard`
- Manage listings
- View bookings
- Earnings overview
- Calendar management

### 7. Admin Controls
- **Route**: `/admin/short-stay`
- Approve/reject listings
- Manage commissions
- Flag suspicious properties

## Firestore Schema

### Collection: `short_stay_listings`
```javascript
{
  id: "auto-generated",
  hostId: "user_id",
  hostName: "string",
  hostEmail: "string",
  hostPhone: "string",
  title: "string",
  description: "string",
  propertyType: "apartment|villa|house|duplex|service_apartment",
  location: {
    city: "string",
    area: "string",
    address: "string",
    coordinates: { lat: number, lng: number }
  },
  pricing: {
    nightlyRate: number,
    cleaningFee: number,
    securityDeposit: number,
    currency: "INR"
  },
  capacity: {
    maxGuests: number,
    bedrooms: number,
    beds: number,
    bathrooms: number
  },
  amenities: ["wifi", "ac", "parking", "kitchen", "tv", "lift", "power_backup"],
  houseRules: ["no_smoking", "no_pets", "no_parties"],
  checkInTime: "14:00",
  checkOutTime: "11:00",
  images: ["url1", "url2", "url3"],
  availability: {
    blockedDates: ["2025-01-15", "2025-01-16"],
    minimumStay: 1
  },
  status: "pending|approved|rejected|inactive",
  rating: number,
  reviewCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `short_stay_bookings`
```javascript
{
  id: "auto-generated",
  listingId: "string",
  listingTitle: "string",
  hostId: "string",
  guestId: "string",
  guestName: "string",
  guestEmail: "string",
  guestPhone: "string",
  checkIn: "2025-01-20",
  checkOut: "2025-01-25",
  numberOfGuests: number,
  numberOfNights: number,
  pricing: {
    nightlyRate: number,
    totalNights: number,
    subtotal: number,
    cleaningFee: number,
    securityDeposit: number,
    total: number
  },
  paymentStatus: "pending|completed|failed|refunded",
  paymentId: "razorpay_payment_id",
  bookingStatus: "pending|confirmed|cancelled|completed",
  specialRequests: "string",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## File Structure
```
src/
├── pages/
│   └── ShortStay/
│       ├── ShortStayLanding.jsx
│       ├── ShortStayLanding.css
│       ├── ListProperty.jsx
│       ├── ListProperty.css
│       ├── PropertyDetails.jsx
│       ├── PropertyDetails.css
│       ├── HostDashboard.jsx
│       ├── HostDashboard.css
│       ├── MyBookings.jsx (extend existing)
│       └── AdminShortStay.jsx
├── components/
│   └── ShortStay/
│       ├── ShortStayCard.jsx
│       ├── ShortStayCard.css
│       ├── SearchBar.jsx
│       ├── DatePicker.jsx
│       ├── BookingWidget.jsx
│       └── AvailabilityCalendar.jsx
└── services/
    └── shortStayService.js
```

## Routes to Add
```javascript
<Route path="/short-stay" element={<ShortStayLanding />} />
<Route path="/short-stay/list-property" element={<ListProperty />} />
<Route path="/short-stay/:id" element={<PropertyDetails />} />
<Route path="/short-stay/host-dashboard" element={<HostDashboard />} />
<Route path="/admin/short-stay" element={<AdminShortStay />} />
```

## Integration Points
- Add "Short Stay" link to main navigation
- Add "My Short Stays" section to Profile page
- Integrate with existing booking system
- Use existing payment gateway (Razorpay)

## Design Guidelines
- Match Bada Builder branding (purple theme)
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Clean, modern UI similar to Airbnb
- Consistent with existing components

## Next Steps
1. Create landing page with search
2. Build property listing form
3. Implement property details page
4. Add booking system
5. Create host dashboard
6. Integrate with user profile
7. Add admin controls
