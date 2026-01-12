# Bada Builder Backend API

Complete backend API for Bada Builder real estate platform using PostgreSQL and JWT authentication.

## Features

- ✅ JWT Authentication
- ✅ PostgreSQL Database
- ✅ User Management
- ✅ Property Management
- ✅ Lead Generation
- ✅ Site Visit Bookings
- ✅ Subscription System
- ✅ Razorpay Payment Integration
- ✅ Cloudinary Image Upload
- ✅ SMTP Email Service
- ✅ Live Grouping Properties
- ✅ Complaints System

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env` file and update with your credentials
   - Ensure PostgreSQL database is accessible

3. **Run Database Migrations**
   ```bash
   npm run migrate
   ```

4. **Start Server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Users
- `POST /api/users/profile-photo` - Upload profile photo (requires auth)
- `GET /api/users/stats` - Get user statistics (requires auth)

### Properties
- `GET /api/properties` - Get all properties (public)
- `GET /api/properties/:id` - Get single property (public)
- `POST /api/properties` - Create property (requires auth + subscription)
- `PUT /api/properties/:id` - Update property (requires auth, within 3 days)
- `DELETE /api/properties/:id` - Delete property (requires auth)
- `GET /api/properties/user/my-properties` - Get user's properties (requires auth)

### Leads
- `POST /api/leads` - Create lead (public)
- `GET /api/leads` - Get all leads

### Bookings
- `POST /api/bookings` - Create booking (requires auth)
- `POST /api/bookings/verify-payment` - Verify payment (requires auth)
- `GET /api/bookings/my-bookings` - Get user's bookings (requires auth)
- `GET /api/bookings/:id` - Get single booking (requires auth)

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans (public)
- `POST /api/subscriptions/create-order` - Create subscription order (requires auth)
- `POST /api/subscriptions/verify-payment` - Verify subscription payment (requires auth)
- `GET /api/subscriptions/status` - Get subscription status (requires auth)

### Live Grouping
- `GET /api/live-grouping` - Get all live grouping properties (public)
- `GET /api/live-grouping/:id` - Get single property (public)
- `POST /api/live-grouping` - Create property (requires auth)
- `PUT /api/live-grouping/:id` - Update property (requires auth)
- `PATCH /api/live-grouping/:id/join` - Join live grouping (requires auth)

### Complaints
- `POST /api/complaints` - Create complaint (optional auth)
- `GET /api/complaints/my-complaints` - Get user's complaints (requires auth)
- `GET /api/complaints/:id` - Get single complaint (requires auth)
- `PATCH /api/complaints/:id/status` - Update complaint status (requires auth)

## Authentication

Include JWT token in request headers:
```
Authorization: Bearer <token>
```

## Database Schema

See `scripts/migrate.js` for complete database schema.

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay key secret
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Email sender address

## License

ISC
