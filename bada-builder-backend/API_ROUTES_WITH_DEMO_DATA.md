# API Routes with Demo Data

Complete API documentation organized by routes and HTTP methods with demo data for each endpoint.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication Routes (`/api/auth`)

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "9876543210",
  "userType": "individual"
}
```

**Alternative Demo Data:**
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

**Response:** `201 Created`
```json
{
  "message": "User registered successfully. Please login.",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "userType": "individual"
  }
}
```

---

### POST `/api/auth/login`
Login user and get JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "userType": "individual",
    "profilePhoto": null,
    "isSubscribed": false,
    "subscriptionExpiry": null,
    "subscriptionPlan": null,
    "createdAt": "2024-12-20T10:00:00.000Z"
  }
}
```

**⚠️ Save the `token` for authenticated requests!**

---

### GET `/api/auth/me`
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "phone": "9876543210",
    "user_type": "individual",
    "profile_photo": "https://cloudinary.com/...",
    "is_subscribed": true,
    "subscription_expiry": "2025-06-20T10:00:00.000Z",
    "subscription_plan": "6_months",
    "subscription_price": "2500.00",
    "subscribed_at": "2024-12-20T10:00:00.000Z",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### PUT `/api/auth/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "9876543211",
  "userType": "developer"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe Updated",
    "phone": "9876543211",
    "user_type": "developer",
    "profile_photo": "https://cloudinary.com/...",
    "is_subscribed": true,
    "subscription_expiry": "2025-06-20T10:00:00.000Z",
    "subscription_plan": "6_months",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

## 👤 User Routes (`/api/users`)

### POST `/api/users/profile-photo`
Upload profile photo.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `multipart/form-data`
```
photo: [Select image file]
```

**Response:** `200 OK`
```json
{
  "profilePhoto": "https://res.cloudinary.com/dba4cop9z/image/upload/v1234567890/profile-photos/photo.jpg"
}
```

---

### GET `/api/users/stats`
Get user statistics (properties, bookings, live groupings count).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "properties": 5,
  "bookings": 3,
  "liveGroupings": 2
}
```

---

## 🏠 Property Routes (`/api/properties`)

### GET `/api/properties`
Get all properties with optional filters.

**Query Parameters:**
- `type` (optional): Flat, House, Villa, Plot, Shop, Office, etc.
- `location` (optional): Mumbai, Delhi, Bangalore, etc.
- `status` (optional): active, expired, pending (default: active)
- `userType` (optional): individual, developer
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Requests:**
```http
GET /api/properties
GET /api/properties?type=Flat&location=Mumbai&status=active
GET /api/properties?userType=developer&limit=10&offset=0
```

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Beautiful 3BHK Flat in Andheri",
      "type": "Flat",
      "location": "Andheri West, Mumbai",
      "price": "1.2 Crores",
      "bhk": "3BHK",
      "description": "Spacious 3BHK flat...",
      "facilities": ["Parking", "Lift", "Power Backup"],
      "image_url": "https://cloudinary.com/...",
      "images": ["https://cloudinary.com/...", "https://cloudinary.com/..."],
      "user_id": 1,
      "user_type": "individual",
      "status": "active",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### GET `/api/properties/:id`
Get single property by ID.

**Example:**
```http
GET /api/properties/1
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": 1,
    "title": "Beautiful 3BHK Flat in Andheri",
    "type": "Flat",
    "location": "Andheri West, Mumbai",
    "price": "1.2 Crores",
    "bhk": "3BHK",
    "description": "Spacious 3BHK flat...",
    "facilities": ["Parking", "Lift", "Power Backup"],
    "image_url": "https://cloudinary.com/...",
    "images": ["https://cloudinary.com/..."],
    "user_id": 1,
    "user_type": "individual",
    "user_name": "John Doe",
    "user_email": "john.doe@example.com",
    "user_phone": "9876543210",
    "status": "active",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### POST `/api/properties`
Create a new property (requires authentication + subscription).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `multipart/form-data`

**Individual Property:**
```
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

**Developer Property:**
```
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

**More Examples:**

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
images: [Select image file(s)]
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
images: [Select image file(s)]
```

**Plot:**
```
title: Residential Plot in Thane
type: Plot
location: Thane, Mumbai
price: 50 Lakhs
description: Prime residential plot, ready for construction
images: [Select image file(s)]
```

**Response:** `201 Created`
```json
{
  "property": {
    "id": 1,
    "title": "Beautiful 3BHK Flat in Andheri",
    "type": "Flat",
    "location": "Andheri West, Mumbai",
    "price": "1.2 Crores",
    "bhk": "3BHK",
    "description": "Spacious 3BHK flat...",
    "facilities": ["Parking", "Lift", "Power Backup"],
    "image_url": "https://cloudinary.com/...",
    "images": ["https://cloudinary.com/..."],
    "user_id": 1,
    "user_type": "individual",
    "status": "active",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### PUT `/api/properties/:id`
Update property (only within 3 days of creation, requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `multipart/form-data`
```
title: Updated: Beautiful 3BHK Flat in Andheri
price: 1.3 Crores
description: Updated description with more details about the property.
images: [Select new image file(s) - optional]
```

**Example:**
```http
PUT /api/properties/1
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": 1,
    "title": "Updated: Beautiful 3BHK Flat in Andheri",
    "price": "1.3 Crores",
    "description": "Updated description...",
    "updated_at": "2024-12-21T10:00:00.000Z"
  }
}
```

---

### DELETE `/api/properties/:id`
Delete property (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```http
DELETE /api/properties/1
```

**Response:** `200 OK`
```json
{
  "message": "Property deleted successfully"
}
```

---

### GET `/api/properties/user/my-properties`
Get all properties of the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Beautiful 3BHK Flat in Andheri",
      "type": "Flat",
      "location": "Andheri West, Mumbai",
      "price": "1.2 Crores",
      "status": "active",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

---

## 📋 Lead Routes (`/api/leads`)

### POST `/api/leads`
Create a new lead (public endpoint, no authentication required).

**Request Body:**
```json
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

**Response:** `201 Created`
```json
{
  "lead": {
    "id": 1,
    "name": "Rajesh Kumar",
    "requirement_type": "Flat",
    "location": "Mumbai",
    "phone": "9876543210",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### GET `/api/leads`
Get all leads (admin endpoint).

**Query Parameters:**
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```http
GET /api/leads?limit=50&offset=0
```

**Response:** `200 OK`
```json
{
  "leads": [
    {
      "id": 1,
      "name": "Rajesh Kumar",
      "requirement_type": "Flat",
      "location": "Mumbai",
      "phone": "9876543210",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## 📅 Booking Routes (`/api/bookings`)

### POST `/api/bookings`
Create a new booking (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (Post-visit Payment):**
```json
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

**Request Body (Pre-visit Payment):**
```json
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

**Response (Post-visit):** `201 Created`
```json
{
  "booking": {
    "id": 1,
    "property_id": 1,
    "property_title": "Beautiful 3BHK Flat in Andheri",
    "property_location": "Andheri West, Mumbai",
    "user_id": 1,
    "user_email": "john.doe@example.com",
    "visit_date": "2024-12-25",
    "visit_time": "10:00 AM",
    "number_of_people": 2,
    "person1_name": "Rajesh Kumar",
    "person2_name": "Priya Kumar",
    "pickup_address": "123 Main Street, Andheri, Mumbai",
    "payment_method": "postvisit",
    "payment_status": "pending",
    "status": "pending",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

**Response (Pre-visit):** `201 Created`
```json
{
  "booking": {
    "id": 1,
    "property_id": 1,
    "property_title": "Beautiful 3BHK Flat in Andheri",
    "property_location": "Andheri West, Mumbai",
    "user_id": 1,
    "user_email": "john.doe@example.com",
    "visit_date": "2024-12-25",
    "visit_time": "2:00 PM",
    "number_of_people": 3,
    "person1_name": "Amit Sharma",
    "person2_name": "Anita Sharma",
    "person3_name": "Arjun Sharma",
    "pickup_address": "456 Park Avenue, Bandra, Mumbai",
    "payment_method": "razorpay_previsit",
    "payment_status": "pending",
    "status": "pending",
    "created_at": "2024-12-20T10:00:00.000Z"
  },
  "payment": {
    "orderId": "order_ABC123",
    "amount": 300,
    "currency": "INR"
  }
}
```

---

### POST `/api/bookings/verify-payment`
Verify Razorpay payment for booking.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "booking_id": 1,
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "signature_hash_here"
}
```

**Response:** `200 OK`
```json
{
  "booking": {
    "id": 1,
    "payment_status": "completed",
    "razorpay_payment_id": "pay_XYZ789",
    "payment_amount": 300,
    "payment_currency": "INR",
    "payment_timestamp": "2024-12-20T10:00:00.000Z",
    "status": "confirmed"
  },
  "message": "Payment verified successfully"
}
```

---

### GET `/api/bookings/my-bookings`
Get all bookings of the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "bookings": [
    {
      "id": 1,
      "property_id": 1,
      "property_title": "Beautiful 3BHK Flat in Andheri",
      "property_location": "Andheri West, Mumbai",
      "property_image": "https://cloudinary.com/...",
      "visit_date": "2024-12-25",
      "visit_time": "10:00 AM",
      "number_of_people": 2,
      "payment_status": "completed",
      "status": "confirmed",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/bookings/:id`
Get single booking by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/bookings/1
```

**Response:** `200 OK`
```json
{
  "booking": {
    "id": 1,
    "property_id": 1,
    "property_title": "Beautiful 3BHK Flat in Andheri",
    "property_location": "Andheri West, Mumbai",
    "property_image": "https://cloudinary.com/...",
    "visit_date": "2024-12-25",
    "visit_time": "10:00 AM",
    "number_of_people": 2,
    "person1_name": "Rajesh Kumar",
    "person2_name": "Priya Kumar",
    "pickup_address": "123 Main Street, Andheri, Mumbai",
    "payment_method": "postvisit",
    "payment_status": "completed",
    "status": "confirmed",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

## 💳 Subscription Routes (`/api/subscriptions`)

### GET `/api/subscriptions/plans`
Get all available subscription plans (public endpoint).

**Response:** `200 OK`
```json
{
  "plans": [
    {
      "id": "1_month",
      "name": "1 Month",
      "duration": 1,
      "price": 500,
      "description": "Post properties for 1 month"
    },
    {
      "id": "6_months",
      "name": "6 Months",
      "duration": 6,
      "price": 2500,
      "description": "Post properties for 6 months",
      "savings": "Save ₹500"
    },
    {
      "id": "12_months",
      "name": "12 Months",
      "duration": 12,
      "price": 4500,
      "description": "Post properties for 12 months",
      "savings": "Save ₹1500"
    }
  ]
}
```

---

### POST `/api/subscriptions/create-order`
Create Razorpay order for subscription (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "plan_id": "6_months"
}
```

**Valid plan_id values:**
- `1_month`
- `6_months`
- `12_months`

**Response:** `200 OK`
```json
{
  "orderId": "order_ABC123",
  "amount": 2500,
  "currency": "INR",
  "plan": "6_months",
  "duration": 6
}
```

---

### POST `/api/subscriptions/verify-payment`
Verify Razorpay payment for subscription (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "signature_hash_here",
  "plan_id": "6_months"
}
```

**Response:** `200 OK`
```json
{
  "message": "Subscription activated successfully",
  "subscription": {
    "isSubscribed": true,
    "expiry": "2025-06-20T10:00:00.000Z",
    "plan": "6_months",
    "price": 2500
  }
}
```

---

### GET `/api/subscriptions/status`
Get current subscription status (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "isSubscribed": true,
  "expiry": "2025-06-20T10:00:00.000Z",
  "plan": "6_months",
  "price": 2500,
  "subscribedAt": "2024-12-20T10:00:00.000Z"
}
```

---

## 🏘️ Live Grouping Routes (`/api/live-grouping`)

### GET `/api/live-grouping`
Get all live grouping properties (public endpoint).

**Response:** `200 OK`
```json
{
  "properties": [
    {
      "id": 1,
      "title": "Premium 3BHK Apartments - Group Buy",
      "developer": "XYZ Developers",
      "location": "Powai, Mumbai",
      "original_price": "2.5 Crores",
      "group_price": "2.2 Crores",
      "discount": "12%",
      "savings": "30 Lakhs",
      "type": "Flat",
      "total_slots": 50,
      "filled_slots": 15,
      "min_buyers": 20,
      "status": "Active",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/live-grouping/:id`
Get single live grouping property by ID.

**Example:**
```http
GET /api/live-grouping/1
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": 1,
    "title": "Premium 3BHK Apartments - Group Buy",
    "developer": "XYZ Developers",
    "location": "Powai, Mumbai",
    "original_price": "2.5 Crores",
    "group_price": "2.2 Crores",
    "discount": "12%",
    "savings": "30 Lakhs",
    "type": "Flat",
    "total_slots": 50,
    "filled_slots": 15,
    "min_buyers": 20,
    "benefits": ["Free Parking", "Clubhouse Access"],
    "area": "1500 sqft",
    "possession": "2026-06-30",
    "rera_number": "P52100001234",
    "description": "Premium apartments with world-class amenities...",
    "status": "Active",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### POST `/api/live-grouping`
Create live grouping property (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `multipart/form-data`
```
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

**Response:** `201 Created`
```json
{
  "property": {
    "id": 1,
    "title": "Premium 3BHK Apartments - Group Buy",
    "developer": "XYZ Developers",
    "location": "Powai, Mumbai",
    "original_price": "2.5 Crores",
    "group_price": "2.2 Crores",
    "status": "Active",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### PUT `/api/live-grouping/:id`
Update live grouping property (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:** `multipart/form-data`
```
title: Updated Premium 3BHK Apartments
filled_slots: 25
status: Closing Soon
images: [Select new image file(s) - optional]
```

**Example:**
```http
PUT /api/live-grouping/1
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": 1,
    "title": "Updated Premium 3BHK Apartments",
    "filled_slots": 25,
    "status": "Closing Soon",
    "updated_at": "2024-12-21T10:00:00.000Z"
  }
}
```

---

### PATCH `/api/live-grouping/:id/join`
Join a live grouping (increment filled slots, requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```http
PATCH /api/live-grouping/1/join
```

**Response:** `200 OK`
```json
{
  "property": {
    "id": 1,
    "filled_slots": 16,
    "status": "Active"
  }
}
```

---

## 🚨 Complaint Routes (`/api/complaints`)

### POST `/api/complaints`
Create a new complaint (optional authentication).

**Headers:**
```
Authorization: Bearer <token> (optional)
```

**Request:** `multipart/form-data`
```
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
media: [Select image file]
```

```
name: Vikram Joshi
email: vikram.joshi@example.com
phone: 9876543212
complaint_type: Garbage Collection
location: Powai, Mumbai
description: Garbage not being collected regularly
```

**Response:** `201 Created`
```json
{
  "complaint": {
    "id": 1,
    "user_id": 1,
    "name": "Ramesh Patel",
    "email": "ramesh.patel@example.com",
    "phone": "9876543210",
    "complaint_type": "Water Supply Issue",
    "location": "Andheri West, Mumbai",
    "description": "No water supply for the past 3 days...",
    "media_urls": ["https://cloudinary.com/..."],
    "status": "Submitted",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### GET `/api/complaints/my-complaints`
Get all complaints of the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "complaints": [
    {
      "id": 1,
      "name": "Ramesh Patel",
      "email": "ramesh.patel@example.com",
      "complaint_type": "Water Supply Issue",
      "location": "Andheri West, Mumbai",
      "status": "Submitted",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/complaints/:id`
Get single complaint by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/complaints/1
```

**Response:** `200 OK`
```json
{
  "complaint": {
    "id": 1,
    "name": "Ramesh Patel",
    "email": "ramesh.patel@example.com",
    "phone": "9876543210",
    "complaint_type": "Water Supply Issue",
    "location": "Andheri West, Mumbai",
    "description": "No water supply for the past 3 days...",
    "media_urls": ["https://cloudinary.com/..."],
    "status": "Submitted",
    "created_at": "2024-12-20T10:00:00.000Z"
  }
}
```

---

### GET `/api/complaints`
Get all complaints (admin endpoint).

**Query Parameters:**
- `status` (optional): Submitted, Under Review, In Progress, Resolved, Rejected
- `limit` (optional): Number of results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```http
GET /api/complaints?status=Submitted&limit=50&offset=0
```

**Response:** `200 OK`
```json
{
  "complaints": [
    {
      "id": 1,
      "name": "Ramesh Patel",
      "complaint_type": "Water Supply Issue",
      "status": "Submitted",
      "created_at": "2024-12-20T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### PATCH `/api/complaints/:id/status`
Update complaint status (admin, requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "In Progress",
  "admin_notes": "Work in progress. Expected completion by end of week."
}
```

**Valid status values:**
- `Submitted`
- `Under Review`
- `In Progress`
- `Resolved`
- `Rejected`

**Example:**
```http
PATCH /api/complaints/1/status
```

**Response:** `200 OK`
```json
{
  "complaint": {
    "id": 1,
    "status": "In Progress",
    "admin_notes": "Work in progress. Expected completion by end of week.",
    "updated_at": "2024-12-21T10:00:00.000Z"
  }
}
```

---

## 🏥 Health Check

### GET `/health`
Check server and database health.

**Example:**
```http
GET http://localhost:5000/health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "database": "database connected successfully",
  "timestamp": "2024-12-20T10:00:00.000Z"
}
```

---

## 📊 Summary by HTTP Method

### GET Requests
- `GET /health` - Health check
- `GET /api/auth/me` - Get current user
- `GET /api/users/stats` - Get user statistics
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `GET /api/properties/user/my-properties` - Get user's properties
- `GET /api/leads` - Get all leads
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/status` - Get subscription status
- `GET /api/live-grouping` - Get all live grouping properties
- `GET /api/live-grouping/:id` - Get live grouping property by ID
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/:id` - Get complaint by ID

### POST Requests
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/users/profile-photo` - Upload profile photo
- `POST /api/properties` - Create property
- `POST /api/leads` - Create lead
- `POST /api/bookings` - Create booking
- `POST /api/bookings/verify-payment` - Verify booking payment
- `POST /api/subscriptions/create-order` - Create subscription order
- `POST /api/subscriptions/verify-payment` - Verify subscription payment
- `POST /api/live-grouping` - Create live grouping property
- `POST /api/complaints` - Create complaint

### PUT Requests
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/properties/:id` - Update property
- `PUT /api/live-grouping/:id` - Update live grouping property

### PATCH Requests
- `PATCH /api/live-grouping/:id/join` - Join live grouping
- `PATCH /api/complaints/:id/status` - Update complaint status

### DELETE Requests
- `DELETE /api/properties/:id` - Delete property

---

## 🔑 Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <token>
```

Get the token by logging in via `POST /api/auth/login`.

---

## 📝 Notes

1. **File Uploads**: Use `multipart/form-data` for endpoints that accept files
2. **Pagination**: Use `limit` and `offset` query parameters
3. **Error Responses**: All errors return JSON with `error` field
4. **Status Codes**: 
   - `200` - Success
   - `201` - Created
   - `400` - Bad Request
   - `401` - Unauthorized
   - `404` - Not Found
   - `500` - Server Error
