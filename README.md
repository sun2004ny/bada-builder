# Bada Builder - Complete Project Documentation

## Table of Contents

1. [Project Title](#project-title)
2. [Project Description](#project-description)
3. [Tech Stack](#tech-stack)
4. [System Architecture](#system-architecture)
5. [Project Folder Structure](#project-folder-structure)
6. [Frontend Documentation](#frontend-documentation)
7. [Backend Documentation](#backend-documentation)
8. [API Documentation](#api-documentation)
9. [Database Design](#database-design)
10. [How It Works](#how-it-works)
11. [Installation & Setup Guide](#installation--setup-guide)
12. [Deployment Guide](#deployment-guide)
13. [Security Implementation](#security-implementation)
14. [Performance Optimization](#performance-optimization)
15. [Future Improvements](#future-improvements)
16. [Known Issues](#known-issues)
17. [License](#license)
18. [Contributing Guidelines](#contributing-guidelines)

---

## Project Title

**Bada Builder** - Real Estate Platform

---

## Project Description

### Overview

Bada Builder is a comprehensive full-stack real estate platform that connects property buyers, sellers, developers, and investors. The platform provides a seamless experience for property listings, site visit bookings, live grouping properties, short-stay rentals, investment opportunities, and various real estate services.

### Purpose

The platform aims to:
- Simplify property discovery and listing processes
- Enable seamless site visit bookings with payment integration
- Facilitate group buying through live grouping features
- Provide short-stay rental services
- Offer investment opportunities and data center investments
- Connect users with real estate services and marketing solutions
- Provide educational resources and calculators for real estate professionals

### Target Users

1. **Individual Users**: Property buyers and sellers looking to list or find properties
2. **Developers**: Real estate developers managing multiple property listings
3. **Investors**: Users interested in real estate investments and data centers
4. **Hosts**: Short-stay property owners offering rental services
5. **Travelers**: Users seeking short-stay accommodations
6. **Administrators**: Platform administrators managing content and users

### Key Features

- 🔐 **User Authentication & Authorization**: JWT-based authentication with OTP verification
- 🏠 **Property Management**: Create, update, delete, and browse properties with advanced filtering
- 📅 **Site Visit Bookings**: Book property visits with payment integration (Razorpay)
- 👥 **Live Grouping**: Group buying feature for properties with dynamic pricing
- 🏨 **Short Stay Rentals**: List and book short-stay properties with calendar management
- 💳 **Subscription System**: Tiered subscription plans for individuals and developers
- ⭐ **Reviews & Ratings**: Property reviews and ratings system
- 💬 **Real-time Chat**: Socket.io-based messaging system
- 📋 **Wishlists & Favorites**: Save and manage favorite properties
- 📧 **Email Notifications**: Automated email notifications for bookings and transactions
- 🗺️ **Interactive Maps**: Location-based property search with map integration
- 📊 **Admin Dashboard**: Comprehensive admin panel for platform management
- 📈 **Analytics**: Revenue tracking and property performance analytics
- 🏛️ **Complaints System**: Civic complaints registration and tracking
- 🧮 **Real Estate Calculators**: Various financial calculators (FFO, NOI, Cap Rate, etc.)
- 📚 **Educational Resources**: REIT guides, market analysis, and professional resources

---

## Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.0 | UI framework |
| **React Router DOM** | ^7.6.0 | Client-side routing |
| **Vite** | ^6.3.5 | Build tool and dev server |
| **Tailwind CSS** | ^4.1.7 | Utility-first CSS framework |
| **Framer Motion** | ^12.23.26 | Animation library |
| **React Hot Toast** | ^2.6.0 | Toast notifications |
| **Socket.io Client** | ^4.8.3 | Real-time communication |
| **React Leaflet** | ^5.0.0 | Map integration |
| **Three.js** | ^0.182.0 | 3D visualization |
| **@react-three/fiber** | ^9.4.2 | React renderer for Three.js |
| **Razorpay** | ^2.9.6 | Payment gateway integration |
| **Axios** | (via services) | HTTP client |
| **React Icons** | ^5.5.0 | Icon library |
| **Lucide React** | ^0.562.0 | Additional icons |
| **KaTeX** | ^0.16.22 | Math rendering for calculators |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest LTS | Runtime environment |
| **Express.js** | ^4.18.2 | Web framework |
| **PostgreSQL** | Latest | Relational database |
| **pg (node-postgres)** | ^8.11.3 | PostgreSQL client |
| **JSON Web Token** | ^9.0.2 | Authentication tokens |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **Express Validator** | ^7.0.1 | Input validation |
| **Multer** | ^1.4.5-lts.1 | File upload handling |
| **Socket.io** | ^4.8.3 | Real-time WebSocket communication |
| **Nodemailer** | ^6.9.7 | Email service |
| **Razorpay** | ^2.9.6 | Payment gateway |
| **Cloudinary** | ^1.41.0 | Image and media storage |
| **Helmet** | ^7.1.0 | Security headers |
| **CORS** | ^2.8.5 | Cross-origin resource sharing |
| **Express Rate Limit** | ^7.1.5 | Rate limiting |
| **dotenv** | ^16.3.1 | Environment variable management |

### Database

- **PostgreSQL** (hosted on Neon DB or similar cloud provider)
- Connection pooling for optimal performance
- SSL/TLS encrypted connections

### APIs Used

1. **Razorpay API**: Payment processing for subscriptions and bookings
2. **Cloudinary API**: Image and media upload/storage
3. **SMTP/Email Service**: Transactional emails (Brevo/SendGrid)
4. **OpenStreetMap Nominatim API**: Geocoding and reverse geocoding (via proxy)
5. **Leaflet Maps**: Interactive map rendering

### Other Tools & Services

- **Git**: Version control
- **Nodemon**: Development auto-reload
- **ESLint**: Code linting
- **Vercel/Netlify**: Frontend hosting
- **Render/Railway**: Backend hosting
- **Postman**: API testing

---

## System Architecture

### High-level Architecture

```
┌─────────────────┐
│   React Frontend │  (Vite + React Router)
│   (Vercel/Netlify)│
└────────┬────────┘
         │ HTTPS/REST API
         │ WebSocket (Socket.io)
         ▼
┌─────────────────┐
│  Express Backend │  (Node.js + Express)
│   (Render/Railway)│
└────────┬────────┘
         │ PostgreSQL Protocol
         ▼
┌─────────────────┐
│   PostgreSQL DB │  (Neon DB)
└─────────────────┘
         │
         ├─── Razorpay (Payments)
         ├─── Cloudinary (Media)
         └─── SMTP Server (Emails)
```

### Client-Server Flow

1. **User Request**: Client sends HTTP request to Express backend
2. **Authentication**: Middleware validates JWT token (if required)
3. **Rate Limiting**: Request checked against rate limits
4. **Validation**: Input validated using express-validator
5. **Business Logic**: Route handler processes request
6. **Database Query**: PostgreSQL queries executed via connection pool
7. **Response**: JSON response sent back to client
8. **Real-time Updates**: Socket.io broadcasts updates to connected clients

### Request-Response Cycle

```
Client → Express Middleware → Route Handler → Service Layer → Database
                                                                    ↓
Client ← JSON Response ← Route Handler ← Service Layer ← Query Results
```

### Authentication Flow

1. **Registration**:
   - User submits email, password, name
   - Password hashed with bcrypt (10 rounds)
   - User record created in database
   - Welcome email sent

2. **Login**:
   - User submits email and password
   - Password verified against hash
   - JWT token generated (expires in 7 days)
   - Token returned to client
   - Client stores token in localStorage

3. **Authenticated Requests**:
   - Client includes token in `Authorization: Bearer <token>` header
   - Middleware verifies token signature
   - User data fetched from database
   - Request proceeds with `req.user` available

4. **OTP Verification** (Optional):
   - OTP generated and stored in database
   - Email sent with 6-digit OTP
   - OTP expires after 5 minutes
   - User verifies OTP to complete action

---

## Project Folder Structure

### Complete Frontend Folder Structure

```
bada-builder-frontend/
├── public/                          # Static assets
│   ├── _redirects                  # Netlify redirects
│   └── BadaBuilder_Marketing.mp4   # Marketing video
├── src/
│   ├── assets/                     # Images, videos, brochures
│   │   ├── animations/
│   │   ├── brochures/
│   │   ├── creatives/
│   │   ├── images/
│   │   ├── projects/
│   │   └── videos/
│   ├── components/                 # Reusable React components
│   │   ├── Header/                 # Navigation header
│   │   ├── Footer/                 # Site footer
│   │   ├── HeroSection/            # Landing page hero
│   │   ├── PropertyCard/           # Property listing card
│   │   ├── PropertyForm/           # Property creation form
│   │   ├── Chatbot/                # AI chatbot component
│   │   ├── ChatBox/                # Chat interface
│   │   ├── ChatList/               # Chat list sidebar
│   │   ├── LeadModal/              # Lead capture modal
│   │   ├── BookmarkButton/         # Favorite/bookmark button
│   │   ├── DetailedSearchBar/      # Advanced search component
│   │   ├── GlobalSearchBar/        # Global search
│   │   ├── Map/                    # Map components
│   │   │   ├── LocationPicker.jsx
│   │   │   └── PropertyMap.jsx
│   │   ├── Preloader/              # Loading animation
│   │   ├── PropertyReviews/        # Review components
│   │   ├── SubscriptionGuard/      # Subscription check wrapper
│   │   ├── ShortStay/              # Short-stay components
│   │   ├── Wishlist/               # Wishlist components
│   │   └── ui/                     # UI primitives
│   ├── pages/                      # Page components
│   │   ├── Admin/                  # Admin panel pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── PropertyApproval.jsx
│   │   │   ├── PropertiesManagement.jsx
│   │   │   ├── LiveGroupingManagement.jsx
│   │   │   ├── SiteVisitBookings.jsx
│   │   │   └── AdminReviews.jsx
│   │   ├── Exhibition/             # Exhibition pages
│   │   │   ├── ByIndividual.jsx
│   │   │   ├── ByDeveloper.jsx
│   │   │   ├── ByBadaBuilder.jsx
│   │   │   ├── LiveGrouping.jsx
│   │   │   ├── LiveGroupingDetails.jsx
│   │   │   └── ThreeDView.jsx
│   │   ├── ShortStay/              # Short-stay pages
│   │   │   ├── ShortStayLanding.jsx
│   │   │   ├── ShortStayTrips.jsx
│   │   │   ├── ShortStayDetails.jsx
│   │   │   ├── ShortStayReserve.jsx
│   │   │   ├── ListShortStay.jsx
│   │   │   └── HostingDashboard.jsx
│   │   ├── Complaints/             # Complaints pages
│   │   │   ├── RegisterComplaint.jsx
│   │   │   └── MyComplaints.jsx
│   │   ├── Marketing/              # Marketing pages
│   │   │   ├── Marketing.jsx
│   │   │   ├── MarketingTerms.jsx
│   │   │   ├── MarketingRules.jsx
│   │   │   └── MarketingPackageDetails.jsx
│   │   ├── Investments/            # Investment pages
│   │   │   ├── Investments.jsx
│   │   │   ├── InvestmentDetails.jsx
│   │   │   ├── InvestmentListing.jsx
│   │   │   ├── DataCentres.jsx
│   │   │   └── DataCentreDetails.jsx
│   │   ├── Report Data/            # Educational content
│   │   │   ├── LAM.jsx
│   │   │   ├── MarketInvestmentAnalysis.jsx
│   │   │   ├── RealEstateFinancialModelling.jsx
│   │   │   └── [more educational pages]
│   │   ├── calculator/             # Calculator pages
│   │   │   ├── FFOCalculator.jsx
│   │   │   ├── NOICalculator.jsx
│   │   │   ├── CapRateCalculator.jsx
│   │   │   └── [14 more calculators]
│   │   ├── Login.jsx               # Authentication pages
│   │   ├── RegisterWithOTP.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ProfilePage.jsx         # User profile
│   │   ├── Projects.jsx            # Property listings
│   │   ├── PropertyDetails.jsx     # Property detail page
│   │   ├── PostProperty.jsx        # Create property
│   │   ├── MyProperties.jsx        # User's properties
│   │   ├── MyBookings.jsx          # User's bookings
│   │   ├── MyInvestments.jsx       # User's investments
│   │   ├── BookmarkedProperties.jsx # Favorites
│   │   ├── JoinedLiveGroups.jsx    # User's live groups
│   │   ├── MessagesPage.jsx        # Chat interface
│   │   ├── SubscriptionPlans.jsx   # Subscription page
│   │   ├── BookSiteVisit.jsx       # Booking page
│   │   └── [more pages]
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.jsx         # Authentication state
│   │   ├── FavoritesContext.jsx    # Favorites state
│   │   └── PreloaderContext.jsx    # Loading state
│   ├── services/                   # API service functions
│   │   ├── api.js                  # API client setup
│   │   └── [service modules]
│   ├── utils/                      # Utility functions
│   │   └── [utility modules]
│   ├── hooks/                      # Custom React hooks
│   ├── config/                     # Configuration
│   │   └── api.js                  # API base URL
│   ├── styles/                     # Global styles
│   ├── App.jsx                     # Main app component
│   ├── App.css                     # App styles
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global CSS
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # ESLint config
├── netlify.toml                    # Netlify config
├── vercel.json                     # Vercel config
└── README.md                       # Frontend README
```

### Complete Backend Folder Structure

```
bada-builder-backend/
├── config/                         # Configuration files
│   ├── database.js                 # PostgreSQL connection pool
│   └── plans.js                    # Subscription plans config
├── middleware/                     # Express middleware
│   ├── auth.js                     # JWT authentication middleware
│   └── upload.js                   # Multer file upload config
├── routes/                         # API route handlers
│   ├── auth.js                     # Authentication routes
│   ├── otp.js                      # OTP verification routes
│   ├── forgotPassword.js           # Password reset routes
│   ├── users.js                    # User management routes
│   ├── properties.js               # Property CRUD routes
│   ├── bookings.js                 # Site visit booking routes
│   ├── subscriptions.js            # Subscription routes
│   ├── live-grouping.js            # Live grouping routes
│   ├── live-group-dynamic.js       # Dynamic live grouping routes
│   ├── shortStay.js                # Short-stay routes
│   ├── shortStayReviews.js         # Short-stay review routes
│   ├── reviews.js                  # Property review routes
│   ├── chat.js                     # Chat/messaging routes
│   ├── wishlists.js                # Wishlist routes
│   ├── favorites.js                # Favorites routes
│   ├── complaints.js               # Complaints routes
│   ├── leads.js                    # Lead generation routes
│   ├── marketing.js                # Marketing routes
│   ├── admin.js                    # Admin routes
│   ├── adminProperties.js          # Admin property management
│   ├── joined-live-groups.js      # Joined groups routes
│   ├── deleteAccount.js            # Account deletion routes
│   └── proxy.js                    # Proxy routes (Nominatim)
├── services/                       # Business logic services
│   ├── razorpay.js                 # Payment service
│   ├── cloudinary.js               # Image upload service
│   ├── otp.js                      # OTP generation service
│   ├── bookingEmailService.js      # Booking email service
│   ├── complaintEmailService.js    # Complaint email service
│   ├── groupBookingEmailService.js # Group booking emails
│   ├── marketingEmailService.js    # Marketing emails
│   └── shortStayEmailService.js    # Short-stay emails
├── templates/                      # Email templates
│   └── [email template files]
├── utils/                          # Utility functions
│   ├── sendEmail.js                # Email sending utility
│   ├── socket.js                   # Socket.io initialization
│   └── [other utilities]
├── scripts/                        # Database migration scripts
│   ├── migrate.js                  # Main migration script
│   ├── create-otp-tables.js       # OTP tables setup
│   ├── create-admin.js            # Admin user creation
│   ├── migrate-live-grouping.js   # Live grouping migration
│   └── [more migration scripts]
├── server.js                       # Express app entry point
├── package.json                    # Dependencies
├── .env                            # Environment variables (not in git)
├── render.yaml                      # Render deployment config
├── database-indexes.sql            # Database indexes
├── POSTMAN_COLLECTION.json         # Postman API collection
└── README.md                       # Backend README
```

### Database Structure

#### Core Tables

1. **users**: User accounts and profiles
2. **email_otps**: OTP verification codes
3. **properties**: Property listings
4. **bookings**: Site visit bookings
5. **subscriptions**: User subscription records
6. **live_grouping_properties**: Live grouping property listings
7. **live_group_units**: Individual units in live grouping
8. **live_group_bookings**: Live grouping bookings
9. **short_stay_properties**: Short-stay rental properties
10. **short_stay_bookings**: Short-stay reservations
11. **short_stay_reviews**: Short-stay property reviews
12. **reviews**: Property reviews
13. **wishlists**: User wishlists
14. **wishlist_properties**: Properties in wishlists
15. **favorites**: User favorite properties
16. **chats**: Chat conversations
17. **messages**: Chat messages
18. **complaints**: Civic complaints
19. **leads**: Lead generation records
20. **account_deletions**: Account deletion logs

---

## Frontend Documentation

### Pages and Components

#### Public Pages
- **Home (`/`)**: Landing page with hero section and recommended properties
- **Projects (`/projects`)**: Browse all properties with filters
- **Property Details (`/property-details/:id`)**: Detailed property view
- **Exhibition (`/exhibition`)**: Exhibition hub with tabs
  - Individual Properties (`/exhibition/individual`)
  - Developer Properties (`/exhibition/developer`)
  - Live Grouping (`/exhibition/live-grouping`)
  - Bada Builder Properties (`/exhibition/badabuilder`)
- **Short Stay (`/short-stay`)**: Short-stay rental landing
- **Investments (`/investments`)**: Investment opportunities
- **Services (`/services`)**: Platform services
- **About (`/about`)**: About page
- **Contact (`/contact`)**: Contact page

#### Authentication Pages
- **Login (`/login`)**: User login
- **Register (`/register`)**: User registration with OTP
- **Forgot Password (`/forgot-password`)**: Password reset

#### User Pages (Protected)
- **Profile (`/profile`)**: User profile management
- **My Properties (`/my-properties`)**: User's property listings
- **My Bookings (`/my-bookings`)**: User's site visit bookings
- **My Investments (`/my-investments`)**: User's investments
- **Favorites (`/profile/favorites`)**: Bookmarked properties
- **Joined Live Groups (`/profile/joined-live-groups`)**: User's live grouping participations
- **Messages (`/messages`)**: Chat interface
- **My Complaints (`/my-complaints`)**: User's complaints

#### Admin Pages (Protected - Admin Only)
- **Admin Dashboard (`/admin`)**: Admin overview
- **User Management (`/admin/users`)**: Manage users
- **Properties Management (`/admin/properties`)**: Manage properties
- **Live Grouping Management (`/admin/live-grouping`)**: Manage live grouping
- **Site Visit Bookings (`/admin/bookings`)**: Manage bookings
- **Reviews (`/admin/reviews`)**: Moderate reviews
- **Analytics (`/admin/analytics`)**: Platform analytics

### Routing

React Router DOM handles client-side routing:

```jsx
<Routes>
  <Route path="/" element={<RecommendedProjects />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<RegisterWithOTP />} />
  <Route path="/property-details/:id" element={<PropertyDetails />} />
  {/* Protected routes */}
  <Route path="/profile" element={<ProfilePage />} />
  {/* Admin routes */}
  <Route path="/admin" element={<NewAdminLayout />}>
    <Route index element={<AdminDashboard />} />
  </Route>
</Routes>
```

### State Management

- **React Context API**: Used for global state
  - `AuthContext`: User authentication state
  - `FavoritesContext`: Favorites/bookmarks state
  - `PreloaderContext`: Loading state
- **Local State**: React `useState` for component-level state
- **URL State**: React Router for navigation state

### API Integration

API calls are made through service modules:

```javascript
// Example: src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Form Handling

- Controlled components with React state
- Form validation using HTML5 and custom validation
- Error handling with toast notifications (react-hot-toast)
- File uploads handled via FormData and Multer

### Validation

- **Client-side**: HTML5 validation + custom React validation
- **Server-side**: Express Validator middleware
- Real-time validation feedback
- Error messages displayed via toast notifications

### UI/UX Structure

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Animations**: Framer Motion for page transitions and component animations
- **Loading States**: Preloader component and loading overlays
- **Error Handling**: Toast notifications for user feedback
- **Accessibility**: Semantic HTML and ARIA labels
- **Dark Mode**: (Future enhancement)

### Environment Variables Used

```env
VITE_API_URL=http://localhost:5001/api  # Backend API URL
```

---

## Backend Documentation

### Server Setup

**Entry Point**: `server.js`

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
// ... more routes

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Middleware

1. **Authentication (`middleware/auth.js`)**:
   - `authenticate`: Verifies JWT token, adds user to `req.user`
   - `optionalAuth`: Optionally verifies token (for public routes)
   - `isAdmin`: Checks if user is admin

2. **File Upload (`middleware/upload.js`)**:
   - Multer configuration for image uploads
   - Memory storage for Cloudinary uploads
   - File size limits and type validation

3. **Rate Limiting**:
   - Auth endpoints: 50 requests per 15 minutes
   - OTP endpoints: 20 requests per 15 minutes
   - Mutation endpoints: 30 requests per minute
   - Read endpoints: 100 requests per minute

### API Routes

See [API Documentation](#api-documentation) section for complete endpoint list.

### Controllers

Route handlers are organized in `routes/` directory. Each route file handles:
- Request validation
- Business logic
- Database queries
- Response formatting
- Error handling

### Services

Business logic services in `services/`:

- **razorpay.js**: Payment order creation and verification
- **cloudinary.js**: Image upload and management
- **otp.js**: OTP generation and validation
- **Email Services**: Transactional email sending

### Models/Schemas

Database schema defined in migration scripts. Key models:

- **User**: id, email, password, name, phone, user_type, profile_photo, subscription fields
- **Property**: id, user_id, title, type, location, price, images, status, etc.
- **Booking**: id, property_id, user_id, visit_date, visit_time, payment fields
- **Subscription**: id, user_id, plan_id, expiry, status

### Authentication & Authorization

- **JWT Tokens**: Signed with `JWT_SECRET`, expires in 7 days
- **Password Hashing**: bcrypt with 10 salt rounds
- **Role-based Access**: `user_type` field (individual, developer, admin)
- **Token Storage**: Client-side localStorage

### Error Handling

```javascript
// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

### Environment Variables

```env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@badabuilder.com

# Brevo (for OTP emails)
BREVO_API_KEY=your-brevo-api-key
```

---

## API Documentation

### Base URL

```
Development: http://localhost:5001/api
Production: https://your-backend-url.com/api
```

### Authentication

Include JWT token in request headers:

```
Authorization: Bearer <your-token>
```

### Endpoints

#### Authentication Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/auth/register` | Register new user | No | `{ email, password, name, phone?, userType? }` | `{ message, user }` |
| POST | `/auth/login` | Login user | No | `{ email, password }` | `{ token, user }` |
| GET | `/auth/me` | Get current user | Yes | - | `{ user }` |
| PUT | `/auth/profile` | Update profile | Yes | `{ name?, phone?, bio? }` | `{ user }` |

**Example Request - Register**:
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "userType": "individual"
}
```

**Example Response**:
```json
{
  "message": "User registered successfully. Please login.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "userType": "individual"
  }
}
```

#### OTP Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/otp/send` | Send OTP to email | No | `{ email }` | `{ message }` |
| POST | `/otp/verify` | Verify OTP | No | `{ email, otp }` | `{ message, verified }` |

#### Property Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/properties` | Get all properties | Optional | Query: `?type=&location=&minPrice=&maxPrice=&status=` | `{ properties, count }` |
| GET | `/properties/:id` | Get single property | Optional | - | `{ property }` |
| POST | `/properties` | Create property | Yes | `{ title, type, location, price, images, ... }` | `{ property }` |
| PUT | `/properties/:id` | Update property | Yes | `{ title?, type?, location?, ... }` | `{ property }` |
| DELETE | `/properties/:id` | Delete property | Yes | - | `{ message }` |
| GET | `/properties/user/my-properties` | Get user's properties | Yes | - | `{ properties }` |

**Example Request - Create Property**:
```json
POST /api/properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Beautiful 3BHK Apartment",
  "type": "apartment",
  "location": "Mumbai, Maharashtra",
  "price": 5000000,
  "bhk": "3",
  "description": "Spacious apartment with modern amenities",
  "images": [file1, file2, file3]
}
```

#### Booking Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/bookings` | Create booking | Yes | `{ property_id?, visit_date, visit_time, person1_name, number_of_people, ... }` | `{ booking, order }` |
| POST | `/bookings/verify-payment` | Verify payment | Yes | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id }` | `{ booking }` |
| GET | `/bookings/my-bookings` | Get user's bookings | Yes | - | `{ bookings }` |
| GET | `/bookings/:id` | Get single booking | Yes | - | `{ booking }` |

#### Subscription Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/subscriptions/plans` | Get subscription plans | No | - | `{ individualPlans, developerPlans }` |
| POST | `/subscriptions/create-order` | Create subscription order | Yes | `{ plan_id }` | `{ orderId, amount, currency, plan }` |
| POST | `/subscriptions/verify-payment` | Verify subscription payment | Yes | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id }` | `{ subscription }` |
| GET | `/subscriptions/status` | Get subscription status | Yes | - | `{ isSubscribed, expiry, plan }` |

#### Live Grouping Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/live-grouping` | Get all live grouping properties | Optional | - | `{ properties }` |
| GET | `/live-grouping/:id` | Get single property | Optional | - | `{ property }` |
| POST | `/live-grouping` | Create live grouping property | Yes | `{ title, developer, location, ... }` | `{ property }` |
| PUT | `/live-grouping/:id` | Update property | Yes | `{ title?, developer?, ... }` | `{ property }` |
| PATCH | `/live-grouping/:id/join` | Join live grouping | Yes | `{ unit_id }` | `{ message }` |

#### Short Stay Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/short-stay` | Get all short-stay properties | Optional | Query: `?location=&checkIn=&checkOut=` | `{ properties }` |
| GET | `/short-stay/:id` | Get single property | Optional | - | `{ property }` |
| POST | `/short-stay` | Create short-stay property | Yes | `{ title, location, price_per_night, ... }` | `{ property }` |
| POST | `/short-stay/reserve` | Reserve property | Yes | `{ property_id, check_in, check_out, guests }` | `{ booking, order }` |
| GET | `/short-stay/user/my-listings` | Get user's listings | Yes | - | `{ properties }` |
| GET | `/short-stay/reservations/traveler` | Get traveler reservations | Yes | - | `{ bookings }` |
| GET | `/short-stay/reservations/host` | Get host reservations | Yes | - | `{ bookings }` |

#### Review Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/reviews` | Create review | Yes | `{ property_id, rating, comment }` | `{ review }` |
| GET | `/reviews/property/:id` | Get property reviews | No | - | `{ reviews }` |
| GET | `/reviews/stats/:id` | Get review statistics | No | - | `{ averageRating, totalReviews }` |

#### Chat Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/chat/user-chats` | Get user's chats | Yes | - | `{ chats }` |
| POST | `/chat` | Create chat | Yes | `{ recipient_id }` | `{ chat }` |
| POST | `/chat/:chatId/message` | Send message | Yes | `{ content }` | `{ message }` |
| GET | `/chat/:chatId/messages` | Get messages | Yes | - | `{ messages }` |
| PATCH | `/chat/:chatId/read` | Mark as read | Yes | - | `{ message }` |

#### Wishlist Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/wishlists` | Get user's wishlists | Yes | - | `{ wishlists }` |
| POST | `/wishlists` | Create wishlist | Yes | `{ name }` | `{ wishlist }` |
| GET | `/wishlists/:id` | Get wishlist details | Yes | - | `{ wishlist }` |
| POST | `/wishlists/:id/properties` | Add property to wishlist | Yes | `{ property_id }` | `{ message }` |
| DELETE | `/wishlists/:id/properties/:propertyId` | Remove property | Yes | - | `{ message }` |
| DELETE | `/wishlists/:id` | Delete wishlist | Yes | - | `{ message }` |

#### Favorites Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/favorites/toggle` | Toggle favorite | Yes | `{ property_id }` | `{ isFavorite }` |
| GET | `/favorites` | Get favorites | Yes | - | `{ favorites }` |
| GET | `/favorites/ids` | Get favorite IDs | Yes | - | `{ propertyIds }` |

#### Complaint Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/complaints` | Create complaint | Optional | `{ title, description, category, location }` | `{ complaint }` |
| GET | `/complaints/my-complaints` | Get user's complaints | Yes | - | `{ complaints }` |
| GET | `/complaints/:id` | Get single complaint | Yes | - | `{ complaint }` |
| PATCH | `/complaints/:id/status` | Update status | Yes | `{ status }` | `{ complaint }` |

#### Admin Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| GET | `/admin/stats` | Get platform stats | Yes (Admin) | - | `{ stats }` |
| GET | `/admin/bookings` | Get all bookings | Yes (Admin) | - | `{ bookings }` |
| GET | `/admin/properties` | Get all properties | Yes (Admin) | Query: `?status=` | `{ properties }` |
| POST | `/admin/properties` | Create property (admin) | Yes (Admin) | `{ ...property data }` | `{ property }` |
| PUT | `/admin/properties/:id` | Update property | Yes (Admin) | `{ ...property data }` | `{ property }` |
| PATCH | `/admin/properties/:id/status` | Update property status | Yes (Admin) | `{ status }` | `{ property }` |
| DELETE | `/admin/properties/:id` | Delete property | Yes (Admin) | - | `{ message }` |

#### User Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/users/profile-photo` | Upload profile photo | Yes | `FormData: photo` | `{ user }` |
| GET | `/users/stats` | Get user statistics | Yes | - | `{ stats }` |

#### Other Endpoints

| Method | Route | Description | Auth Required | Request Body | Response |
|--------|-------|-------------|---------------|--------------|----------|
| POST | `/leads` | Create lead | No | `{ name, email, phone, message }` | `{ lead }` |
| GET | `/leads` | Get all leads | Yes (Admin) | - | `{ leads }` |
| POST | `/marketing` | Submit marketing request | Yes | `{ package_id, property_details }` | `{ message }` |
| GET | `/health` | Health check | No | - | `{ status, database }` |
| GET | `/proxy/nominatim/search` | Geocode search | No | Query: `?q=` | `{ results }` |
| GET | `/proxy/nominatim/reverse` | Reverse geocode | No | Query: `?lat=&lon=` | `{ result }` |

### Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Database Design

### ER Diagram Explanation

**Core Entities**:
- **Users**: Central entity for all user accounts
- **Properties**: Property listings (linked to users)
- **Bookings**: Site visit bookings (links users to properties)
- **Subscriptions**: User subscription records
- **Live Grouping**: Group buying properties with units
- **Short Stay**: Rental properties with bookings
- **Reviews**: Property reviews (links users to properties)
- **Chats**: Conversations between users
- **Messages**: Messages within chats
- **Wishlists**: User-created wishlists
- **Favorites**: Quick favorite properties
- **Complaints**: Civic complaints

### Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(50) DEFAULT 'individual',
    profile_photo TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_subscribed BOOLEAN DEFAULT FALSE,
    subscription_expiry TIMESTAMP,
    subscription_plan VARCHAR(100),
    subscription_price DECIMAL(10, 2),
    subscribed_at TIMESTAMP,
    bio TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### properties
```sql
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    location VARCHAR(255),
    price DECIMAL(12, 2),
    bhk VARCHAR(50),
    description TEXT,
    facilities TEXT[],
    images TEXT[],
    image_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### bookings
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
    property_title VARCHAR(255),
    property_location VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255),
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    number_of_people INTEGER DEFAULT 1,
    person1_name VARCHAR(255) NOT NULL,
    person2_name VARCHAR(255),
    person3_name VARCHAR(255),
    pickup_address TEXT,
    location_from_map TEXT,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    payment_method VARCHAR(50) DEFAULT 'postvisit',
    payment_status VARCHAR(50) DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relationships

1. **Users → Properties**: One-to-Many (user can have multiple properties)
2. **Users → Bookings**: One-to-Many (user can have multiple bookings)
3. **Properties → Bookings**: One-to-Many (property can have multiple bookings)
4. **Users → Subscriptions**: One-to-Many (user can have subscription history)
5. **Users → Reviews**: One-to-Many (user can write multiple reviews)
6. **Properties → Reviews**: One-to-Many (property can have multiple reviews)
7. **Users → Chats**: Many-to-Many (users can have multiple chats)
8. **Chats → Messages**: One-to-Many (chat can have multiple messages)
9. **Users → Wishlists**: One-to-Many (user can have multiple wishlists)
10. **Wishlists → Properties**: Many-to-Many (via wishlist_properties)

### Indexes

Key indexes for performance:

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_verified ON users(is_verified);

-- Properties
CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_type ON properties(type);

-- Bookings
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_visit_date ON bookings(visit_date);

-- Reviews
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Chats
CREATE INDEX idx_chats_user1_id ON chats(user1_id);
CREATE INDEX idx_chats_user2_id ON chats(user2_id);

-- Messages
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

## How It Works

### User Registration Flow

1. User fills registration form (`/register`)
2. Frontend sends POST request to `/api/auth/register`
3. Backend validates input (email format, password length)
4. Backend checks if email already exists
5. Password hashed with bcrypt (10 rounds)
6. User record created in database
7. Welcome email sent (non-blocking)
8. Response sent: `{ message, user }`
9. User redirected to login page

### Login Flow

1. User enters email and password (`/login`)
2. Frontend sends POST request to `/api/auth/login`
3. Backend finds user by email
4. Password verified against hash
5. JWT token generated (expires in 7 days)
6. Token returned: `{ token, user }`
7. Frontend stores token in localStorage
8. AuthContext updates with user data
9. User redirected to home or intended page

### Main Feature Flow - Property Listing

1. **User Authentication**: User must be logged in
2. **Subscription Check**: User must have active subscription
3. **Property Form**: User fills property details form (`/post-property`)
4. **Image Upload**: Images uploaded to Cloudinary via backend
5. **Property Creation**: POST `/api/properties` with FormData
6. **Backend Processing**:
   - Images uploaded to Cloudinary
   - Property record created in database
   - Status set to 'pending' (admin approval)
   - Subscription credits decremented
7. **Response**: Property created with ID
8. **Admin Approval**: Admin reviews and approves property
9. **Property Live**: Property appears in listings

### Main Feature Flow - Site Visit Booking

1. **Property Selection**: User views property details
2. **Booking Form**: User clicks "Book Site Visit"
3. **Form Submission**: User fills visit date, time, pickup location
4. **Booking Creation**: POST `/api/bookings`
5. **Payment Order**: Razorpay order created
6. **Payment Gateway**: User redirected to Razorpay
7. **Payment Verification**: POST `/api/bookings/verify-payment`
8. **Confirmation**: Booking confirmed, emails sent
9. **Notification**: User receives confirmation email

### Data Flow - Frontend → Backend → Database → Response

```
User Action (Frontend)
    ↓
API Call (Axios)
    ↓
Express Route Handler
    ↓
Authentication Middleware (if required)
    ↓
Validation Middleware (express-validator)
    ↓
Rate Limiting Check
    ↓
Business Logic Processing
    ↓
Database Query (PostgreSQL via pg pool)
    ↓
Database Response
    ↓
Data Transformation
    ↓
JSON Response
    ↓
Frontend Update (React State)
    ↓
UI Re-render
```

### Real-time Chat Flow

1. **Socket Connection**: Client connects to Socket.io server
2. **User Authentication**: Socket authenticated with JWT
3. **Chat Creation**: User initiates chat via POST `/api/chat`
4. **Message Sending**: POST `/api/chat/:chatId/message`
5. **Socket Broadcast**: Message broadcasted to recipient
6. **Real-time Update**: Recipient receives message instantly
7. **Database Storage**: Message saved to database
8. **Read Receipts**: Messages marked as read

---

## Installation & Setup Guide

### Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher (or Neon DB account)
- **npm** or **yarn**: Package manager
- **Git**: Version control

### Clone Repository

```bash
git clone https://github.com/your-username/bada-builder.git
cd bada-builder
```

### Install Dependencies

#### Backend

```bash
cd bada-builder-backend
npm install
```

#### Frontend

```bash
cd bada-builder-frontend
npm install
```

### Setup Environment Variables

#### Backend (.env)

Create `bada-builder-backend/.env`:

```env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email (SMTP)
SMTP_HOST=smtp.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@badabuilder.com

# Brevo (for OTP)
BREVO_API_KEY=your-brevo-api-key
```

#### Frontend (.env)

Create `bada-builder-frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

### Database Setup

1. **Create PostgreSQL Database**:
   ```sql
   CREATE DATABASE badabuilder;
   ```

2. **Run Migration Scripts**:
   ```bash
   cd bada-builder-backend
   npm run migrate
   ```

3. **Create OTP Tables** (if needed):
   ```bash
   npm run setup-otp
   ```

4. **Create Admin User** (optional):
   ```bash
   npm run create-admin
   ```

### Run Frontend

```bash
cd bada-builder-frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Run Backend

```bash
cd bada-builder-backend
npm run dev
```

Backend runs on `http://localhost:5001`

### Verify Installation

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{ "status": "ok", "database": "database connected successfully" }`

2. **Frontend**: Open `http://localhost:5173` in browser

---

## Deployment Guide

### Build Process

#### Frontend Build

```bash
cd bada-builder-frontend
npm run build
```

Output: `dist/` directory with production-ready files

#### Backend Build

No build step required (Node.js runtime). Ensure all dependencies are installed.

### Deployment Steps

#### Frontend Deployment (Vercel/Netlify)

1. **Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   cd bada-builder-frontend
   vercel
   ```
   - Set environment variable: `VITE_API_URL=https://your-backend-url.com/api`

2. **Netlify**:
   - Connect GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Set environment variable: `VITE_API_URL`

#### Backend Deployment (Render/Railway)

1. **Render**:
   - Create new Web Service
   - Connect GitHub repository
   - Root directory: `bada-builder-backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Set all environment variables

2. **Railway**:
   - Create new project
   - Connect GitHub repository
   - Root directory: `bada-builder-backend`
   - Set environment variables
   - Deploy

### Production Configuration

1. **Environment Variables**:
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to production frontend URL
   - Use production database URL
   - Use production API keys

2. **Database**:
   - Use managed PostgreSQL (Neon, Supabase, AWS RDS)
   - Enable SSL connections
   - Set up connection pooling

3. **Security**:
   - Enable HTTPS
   - Set secure CORS origins
   - Use strong JWT_SECRET
   - Enable rate limiting
   - Set up monitoring and logging

---

## Security Implementation

### Authentication Method

- **JWT Tokens**: Stateless authentication
- **Token Expiration**: 7 days
- **Token Storage**: localStorage (consider httpOnly cookies for enhanced security)
- **Password Hashing**: bcrypt with 10 salt rounds

### Data Validation

- **Client-side**: HTML5 validation + React validation
- **Server-side**: Express Validator middleware
- **SQL Injection Prevention**: Parameterized queries (pg library)
- **XSS Prevention**: Helmet.js security headers

### Password Hashing

```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(password, user.password);
```

### Token Handling

```javascript
// Generate token
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### CORS Setup

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
```

### Rate Limiting

- **Auth endpoints**: 50 requests per 15 minutes
- **OTP endpoints**: 20 requests per 15 minutes
- **Mutation endpoints**: 30 requests per minute
- **Read endpoints**: 100 requests per minute

### Additional Security Measures

- **Helmet.js**: Security headers (XSS protection, content security policy)
- **Input Sanitization**: Express Validator sanitization
- **File Upload Validation**: File type and size limits
- **Environment Variables**: Sensitive data not committed to git
- **Database SSL**: Encrypted database connections

---

## Performance Optimization

### Caching

- **Database Query Caching**: Consider Redis for frequently accessed data
- **Static Assets**: CDN for images and media (Cloudinary)
- **API Response Caching**: Cache public property listings

### Lazy Loading

- **React Lazy Loading**: Code splitting for routes
```javascript
const ShortStayTrips = lazy(() => import('./pages/ShortStay/ShortStayTrips'));
```

- **Image Lazy Loading**: Lazy load property images
- **Route-based Code Splitting**: Split code by routes

### Code Splitting

- **Route-based**: Each route loads only required code
- **Component-based**: Large components loaded on demand
- **Vite**: Automatic code splitting

### Database Optimization

- **Indexes**: Strategic indexes on frequently queried columns
- **Connection Pooling**: pg pool for efficient connections
- **Query Optimization**: Efficient SQL queries, avoid N+1 queries
- **Pagination**: Limit results with LIMIT and OFFSET

### Frontend Optimization

- **Image Optimization**: Compressed images, WebP format
- **Bundle Size**: Tree shaking, minification
- **CDN**: Static assets served via CDN
- **Memoization**: React.memo for expensive components

---

## Future Improvements

1. **Enhanced Search**: Elasticsearch for advanced property search
2. **Mobile App**: React Native mobile application
3. **Real-time Notifications**: Push notifications for bookings and messages
4. **Advanced Analytics**: User behavior tracking and analytics dashboard
5. **Multi-language Support**: Internationalization (i18n)
6. **Dark Mode**: Dark theme support
7. **Video Tours**: 360° virtual property tours
8. **AI Recommendations**: ML-based property recommendations
9. **Social Features**: Share properties on social media
10. **Document Management**: Upload and manage property documents
11. **Advanced Filtering**: More sophisticated property filters
12. **Property Comparison**: Compare multiple properties side-by-side
13. **Saved Searches**: Save search criteria and get alerts
14. **Property Analytics**: Track property views and inquiries
15. **Two-Factor Authentication**: Enhanced security with 2FA

---

## Known Issues

1. **Image Upload Size**: Large images may cause timeout (consider client-side compression)
2. **Rate Limiting**: Some users may hit rate limits during development (adjust limits)
3. **Socket Reconnection**: Socket.io may need reconnection handling for unstable networks
4. **Timezone Handling**: Date/time handling may need timezone consideration
5. **File Upload Errors**: Multer memory limits for large files
6. **Database Connection**: Connection pool may need tuning for high traffic
7. **Email Delivery**: Email delivery depends on SMTP provider reliability

---

## License

ISC License

---

## Contributing Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature-name`
6. Create Pull Request

### Code Style

- Follow ESLint rules
- Use meaningful variable names
- Add comments for complex logic
- Write descriptive commit messages

### Testing

- Test your changes locally
- Ensure no breaking changes
- Test on multiple browsers
- Check mobile responsiveness

### Pull Request Process

1. Ensure code follows project style
2. Update documentation if needed
3. Add tests if applicable
4. Request review from maintainers
5. Address feedback

### Reporting Issues

- Use GitHub Issues
- Provide clear description
- Include steps to reproduce
- Add screenshots if applicable
- Specify environment details

---

## Contact & Support

For questions or support, please contact:
- **Email**: support@badabuilder.com
- **GitHub Issues**: [Create an issue](https://github.com/your-username/bada-builder/issues)

---

**Last Updated**: 2024
**Version**: 1.0.0
