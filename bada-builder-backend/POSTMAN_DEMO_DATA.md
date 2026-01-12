# Postman Demo Data Guide

Complete collection of demo data for testing all API endpoints.

## 📥 Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `POSTMAN_COLLECTION.json` file
4. Collection will be imported with all requests and variables

## 🔧 Setup Variables

After importing, set these collection variables:
- `base_url`: `http://localhost:5000/api`
- `token`: (Will be auto-set after login)
- `user_id`: (Will be auto-set after login)
- `property_id`: (Will be auto-set after creating property)
- `booking_id`: (Will be auto-set after creating booking)

## 📋 API Endpoints with Demo Data

### 1. Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9876543210",
  "userType": "individual"
}
```

**Alternative Users:**
```json
// Developer User
{
  "email": "developer@abc.com",
  "password": "password123",
  "name": "ABC Developers",
  "phone": "9876543211",
  "userType": "developer"
}

// Another Individual
{
  "email": "priya.sharma@example.com",
  "password": "password123",
  "name": "Priya Sharma",
  "phone": "9876543212",
  "userType": "individual"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:** Returns `token` - save this for authenticated requests

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "9876543211",
  "userType": "developer"
}
```

---

### 2. Users

#### Upload Profile Photo
```http
POST /api/users/profile-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

photo: [Select image file]
```

#### Get User Stats
```http
GET /api/users/stats
Authorization: Bearer <token>
```

---

### 3. Properties

#### Get All Properties
```http
GET /api/properties?type=Flat&location=Mumbai&status=active&limit=10&offset=0
```

**Query Parameters:**
- `type`: Flat, House, Villa, Plot, Shop, Office, etc.
- `location`: Mumbai, Delhi, Bangalore, etc.
- `status`: active, expired, pending
- `userType`: individual, developer
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

#### Get Property by ID
```http
GET /api/properties/1
```

#### Create Property (Individual)
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Beautiful 3BHK Flat in Andheri
type: Flat
location: Andheri West, Mumbai
price: 1.2 Crores
bhk: 3BHK
description: Spacious 3BHK flat with modern amenities, located in prime Andheri West. Close to metro station and shopping malls.
facilities: Parking
facilities: Lift
facilities: Power Backup
facilities: Security
images: [Select image file(s)]
```

**More Property Examples:**

**2BHK Flat:**
```
title: Cozy 2BHK Apartment in Bandra
type: Flat
location: Bandra West, Mumbai
price: 85 Lakhs
bhk: 2BHK
description: Well-maintained 2BHK apartment in a prime location
facilities: Parking
facilities: Lift
```

**Villa:**
```
title: Luxury Villa in Powai
type: Villa
location: Powai, Mumbai
price: 5 Crores
bhk: 4BHK
description: Spacious 4BHK villa with private garden and modern amenities
facilities: Parking
facilities: Garden
facilities: Swimming Pool
facilities: Security
```

**Plot:**
```
title: Residential Plot in Thane
type: Plot
location: Thane, Mumbai
price: 50 Lakhs
description: Prime residential plot, ready for construction
```

#### Create Property (Developer)
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Luxury Apartments by ABC Developers
type: Flat
location: Powai, Mumbai
price: 2.5 Crores
bhk: 2BHK
description: Premium 2BHK apartments in a gated community with world-class amenities.
company_name: ABC Developers Pvt Ltd
project_name: ABC Luxuria
total_units: 200
completion_date: 2025-12-31
rera_number: P52100001234
facilities: Swimming Pool
facilities: Gym
facilities: Clubhouse
facilities: Parking
facilities: Security
images: [Select image file(s)]
```

#### Update Property
```http
PUT /api/properties/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Updated: Beautiful 3BHK Flat in Andheri
price: 1.3 Crores
description: Updated description with more details about the property.
```

#### Delete Property
```http
DELETE /api/properties/1
Authorization: Bearer <token>
```

#### Get My Properties
```http
GET /api/properties/user/my-properties
Authorization: Bearer <token>
```

---

### 4. Leads

#### Create Lead
```http
POST /api/leads
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "requirement_type": "Flat",
  "location": "Mumbai",
  "phone": "9876543210"
}
```

**More Lead Examples:**
```json
{
  "name": "Priya Singh",
  "requirement_type": "House",
  "location": "Delhi",
  "phone": "9876543211"
}

{
  "name": "Amit Patel",
  "requirement_type": "Villa",
  "location": "Bangalore",
  "phone": "9876543212"
}

{
  "name": "Sneha Desai",
  "requirement_type": "Plot",
  "location": "Pune",
  "phone": "9876543213"
}

{
  "name": "Rahul Sharma",
  "requirement_type": "Shop",
  "location": "Mumbai",
  "phone": "9876543214"
}
```

#### Get All Leads
```http
GET /api/leads?limit=50&offset=0
```

---

### 5. Bookings

#### Create Booking (Post-visit Payment)
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "visit_date": "2024-12-25",
  "visit_time": "10:00 AM",
  "number_of_people": 2,
  "person1_name": "Rajesh Kumar",
  "person2_name": "Priya Kumar",
  "pickup_address": "123 Main Street, Andheri, Mumbai",
  "payment_method": "postvisit"
}
```

#### Create Booking (Pre-visit Payment)
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "property_id": 1,
  "visit_date": "2024-12-25",
  "visit_time": "2:00 PM",
  "number_of_people": 3,
  "person1_name": "Amit Sharma",
  "person2_name": "Anita Sharma",
  "person3_name": "Arjun Sharma",
  "pickup_address": "456 Park Avenue, Bandra, Mumbai",
  "payment_method": "razorpay_previsit"
}
```

**Response:** Returns `payment.orderId` for Razorpay integration

#### Verify Payment
```http
POST /api/bookings/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 1,
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "signature_hash_here"
}
```

#### Get My Bookings
```http
GET /api/bookings/my-bookings
Authorization: Bearer <token>
```

#### Get Booking by ID
```http
GET /api/bookings/1
Authorization: Bearer <token>
```

---

### 6. Subscriptions

#### Get Subscription Plans
```http
GET /api/subscriptions/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": "1_month",
      "name": "1 Month",
      "duration": 1,
      "price": 500
    },
    {
      "id": "6_months",
      "name": "6 Months",
      "duration": 6,
      "price": 2500
    },
    {
      "id": "12_months",
      "name": "12 Months",
      "duration": 12,
      "price": 4500
    }
  ]
}
```

#### Create Subscription Order
```http
POST /api/subscriptions/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": "6_months"
}
```

**Response:** Returns Razorpay order details

#### Verify Subscription Payment
```http
POST /api/subscriptions/verify-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "signature_hash_here",
  "plan_id": "6_months"
}
```

#### Get Subscription Status
```http
GET /api/subscriptions/status
Authorization: Bearer <token>
```

---

### 7. Live Grouping

#### Get All Live Grouping Properties
```http
GET /api/live-grouping
```

#### Get Live Grouping Property by ID
```http
GET /api/live-grouping/1
```

#### Create Live Grouping Property
```http
POST /api/live-grouping
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Premium 3BHK Apartments - Group Buy
developer: XYZ Developers
location: Powai, Mumbai
originalPrice: 2.5 Crores
groupPrice: 2.2 Crores
discount: 12%
savings: 30 Lakhs
type: Flat
totalSlots: 50
minBuyers: 20
benefits: Free Parking
benefits: Clubhouse Access
benefits: Early Bird Discount
area: 1500 sqft
possession: 2026-06-30
reraNumber: P52100001234
description: Premium apartments with world-class amenities in a prime location.
images: [Select image file(s)]
```

#### Join Live Grouping
```http
PATCH /api/live-grouping/1/join
Authorization: Bearer <token>
```

---

### 8. Complaints

#### Create Complaint
```http
POST /api/complaints
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Ramesh Patel
email: ramesh.patel@example.com
phone: 9876543210
complaint_type: Water Supply Issue
location: Andheri West, Mumbai
description: No water supply for the past 3 days. Please resolve this issue urgently.
media: [Select image/video file(s) - optional]
```

**More Complaint Examples:**
```
name: Sunita Mehta
email: sunita.mehta@example.com
phone: 9876543211
complaint_type: Road Repair
location: Bandra, Mumbai
description: Potholes on main road causing traffic issues
```

```
name: Vikram Joshi
email: vikram.joshi@example.com
phone: 9876543212
complaint_type: Garbage Collection
location: Powai, Mumbai
description: Garbage not being collected regularly
```

#### Get My Complaints
```http
GET /api/complaints/my-complaints
Authorization: Bearer <token>
```

#### Get Complaint by ID
```http
GET /api/complaints/1
Authorization: Bearer <token>
```

#### Update Complaint Status (Admin)
```http
PATCH /api/complaints/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Progress",
  "admin_notes": "Work in progress. Expected completion by end of week."
}
```

**Status Options:**
- `Submitted`
- `Under Review`
- `In Progress`
- `Resolved`
- `Rejected`

---

### 9. Health Check

#### Health Check
```http
GET http://localhost:5000/health
```

---

## 🧪 Testing Workflow

### Complete User Journey

1. **Register a new user**
   ```http
   POST /api/auth/register
   ```

2. **Login to get token**
   ```http
   POST /api/auth/login
   ```
   - Copy the `token` from response

3. **Get subscription plans**
   ```http
   GET /api/subscriptions/plans
   ```

4. **Create subscription order** (if needed)
   ```http
   POST /api/subscriptions/create-order
   ```

5. **Create a property**
   ```http
   POST /api/properties
   ```
   - Copy the `property.id` from response

6. **Create a booking**
   ```http
   POST /api/bookings
   ```
   - Use the property_id from step 5

7. **Create a lead** (public, no auth needed)
   ```http
   POST /api/leads
   ```

8. **View your properties**
   ```http
   GET /api/properties/user/my-properties
   ```

9. **View your bookings**
   ```http
   GET /api/bookings/my-bookings
   ```

---

## 📝 Notes

1. **Authentication**: Most endpoints require `Authorization: Bearer <token>` header
2. **File Uploads**: Use `multipart/form-data` for endpoints that accept files
3. **Pagination**: Use `limit` and `offset` query parameters for paginated endpoints
4. **Error Handling**: Check response status codes:
   - `200`: Success
   - `201`: Created
   - `400`: Bad Request
   - `401`: Unauthorized
   - `404`: Not Found
   - `500`: Server Error

5. **Token Management**: 
   - Token expires after 7 days (configurable)
   - Re-login to get a new token
   - Postman collection automatically saves token after login

---

## 🔄 Quick Test Data

### Test Users
- **Individual**: `john.doe@example.com` / `password123`
- **Developer**: `developer@abc.com` / `password123`

### Test Properties
- Property ID: 1 (after creating)
- Use property ID in bookings

### Test Bookings
- Booking ID: 1 (after creating)
- Use booking ID for payment verification

---

## 🚀 Import Collection

1. Download `POSTMAN_COLLECTION.json`
2. Open Postman
3. Click **Import**
4. Select the JSON file
5. All requests will be available with pre-filled demo data
