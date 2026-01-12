# Long Live Module - Long Term Rentals

## Overview
The Long Live module allows users to browse and post properties for long-term rent or lease. This feature has been added to the header navigation, replacing the "Learn REITs" section which has been moved to the footer.

## Navigation Changes

### Header
- **Removed**: "Learn REITs" dropdown
- **Added**: "Long Live" dropdown with two options:
  - Browse Rental Properties (`/long-live/browse`)
  - Post Rental Property (`/long-live/post`)

### Footer
- **Added**: "Learn REITs" section with all educational links:
  - Lease & Asset Management
  - Market & Investment Analysis
  - Financial Modelling
  - Market Research
  - Valuation & Compliance
  - Risk Assessment
  - Stakeholder Communication
  - Types of REITs
  - Taxation in REITs
  - Job Profiles

## Features

### Browse Rental Properties (`/long-live/browse`)
- View all available rental properties
- Filter by:
  - All Properties
  - For Rent
  - For Lease
- Property cards display:
  - Property image
  - Title and location
  - Monthly rent
  - Bedrooms, area, furnishing status
  - Rental type badge (For Rent / For Lease)
- Responsive grid layout
- Empty state with link to post property

### Post Rental Property (`/long-live/post`)
Comprehensive form with the following sections:

#### 1. Basic Details
- Property title
- Description
- Rental type (Rent/Lease)
- Property type (Apartment, House, Villa, Studio, Penthouse)

#### 2. Location
- Street address
- City, State, Pincode

#### 3. Property Details
- Number of bedrooms
- Number of bathrooms
- Area (sq ft)
- Furnishing status (Unfurnished, Semi-Furnished, Fully Furnished)

#### 4. Pricing
- Monthly rent (₹)
- Security deposit (₹)
- Available from date

#### 5. Amenities
Checkbox selection for:
- Parking
- Gym
- Swimming Pool
- Security
- Power Backup
- Lift
- Garden
- Club House
- Play Area
- Wi-Fi

#### 6. Property Images
- Upload up to 10 images
- Images stored in Firebase Storage

#### 7. Contact Details
- Contact name
- Contact phone
- Contact email

## Database Structure

### Collection: `rentalProperties`
```javascript
{
  title: string,
  description: string,
  location: string,
  city: string,
  state: string,
  pincode: string,
  rentalType: 'rent' | 'lease',
  monthlyRent: number,
  securityDeposit: number,
  bedrooms: number,
  bathrooms: number,
  area: number,
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished',
  propertyType: 'apartment' | 'house' | 'villa' | 'studio' | 'penthouse',
  availableFrom: string (date),
  amenities: array,
  images: array (URLs),
  contactName: string,
  contactPhone: string,
  contactEmail: string,
  userId: string,
  status: 'active' | 'inactive',
  createdAt: timestamp,
  views: number,
  inquiries: number
}
```

## Files Created

### Components
- `src/pages/LongLive/LongLiveBrowse.jsx` - Browse rental properties page
- `src/pages/LongLive/LongLiveBrowse.css` - Styles for browse page
- `src/pages/LongLive/LongLivePost.jsx` - Post rental property form
- `src/pages/LongLive/LongLivePost.css` - Styles for post form

### Modified Files
- `src/components/Header/Header.jsx` - Replaced Learn REITs with Long Live
- `src/components/Footer/Footer.jsx` - Added Learn REITs section
- `src/App.jsx` - Added routes for Long Live pages

## Routes
- `/long-live/browse` - Browse rental properties
- `/long-live/post` - Post a rental property

## Design Features
- Purple theme matching website design (#58335e)
- Responsive layout for mobile and desktop
- Smooth animations and transitions
- Card-based property display
- Filter buttons with active states
- Form validation
- Loading states
- Empty states with helpful CTAs

## User Flow

### Browsing Properties
1. User clicks "Long Live" in header
2. Selects "Browse Rental Properties"
3. Views all available properties
4. Can filter by rental type
5. Clicks "View Details" to see full property information

### Posting Property
1. User clicks "Long Live" in header
2. Selects "Post Rental Property"
3. Must be logged in (redirected to login if not)
4. Fills out comprehensive form
5. Uploads property images
6. Submits form
7. Property added to database
8. Redirected to browse page

## Future Enhancements
- Property details page with full information
- Contact owner functionality
- Favorites/Wishlist
- Advanced search filters (price range, location, amenities)
- Property comparison
- Map view
- Virtual tours
- Tenant verification
- Lease agreement templates
- Payment integration
