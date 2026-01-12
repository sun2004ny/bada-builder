# Quick Start Guide - Firebase to PostgreSQL Migration

## ✅ What's Been Done

1. **Backend Created** - Complete PostgreSQL backend with JWT authentication
2. **API Service Created** - Centralized API communication layer
3. **AuthContext Updated** - Now uses JWT instead of Firebase
4. **Login Page Updated** - Uses new API endpoints
5. **Key Components Updated** - LeadModal, Header, MyProperties

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run migrate  # Create database tables
npm run dev      # Start server on port 5000
```

### 2. Frontend Setup

1. **Add Environment Variable**
   Create `.env` in root directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

2. **Test the Connection**
   - Start backend: `cd backend && npm run dev`
   - Start frontend: `npm run dev`
   - Try registering a new user
   - Check backend console for database entries

### 3. Remaining Work

Many components still use Firebase. See `FIREBASE_TO_POSTGRESQL_MIGRATION.md` for:
- List of files that need updates
- Migration patterns
- Code examples

## 🔑 Key Changes

### Authentication
- **Before**: Firebase Auth with `signInWithEmailAndPassword()`
- **After**: JWT tokens stored in localStorage, API calls with `Authorization: Bearer <token>`

### Database
- **Before**: Firestore collections (`collection(db, 'properties')`)
- **After**: REST API endpoints (`propertiesAPI.getAll()`)

### File Storage
- **Before**: Firebase Storage
- **After**: Cloudinary (handled by backend)

## 📝 Important Notes

1. **Token Management**: Tokens are automatically stored/retrieved from localStorage
2. **Error Handling**: API errors are caught and displayed to users
3. **Loading States**: Maintain existing loading states in components
4. **Real-time Updates**: Replace `onSnapshot` with polling or manual refresh

## 🐛 Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### "Unauthorized" errors
- Token might be expired - user needs to login again
- Check if token exists in localStorage

### Database errors
- Run `npm run migrate` in backend folder
- Check database connection string in `backend/.env`

## 📚 API Reference

All API methods are in `src/services/api.js`:

- `authAPI.register()`, `authAPI.login()`, `authAPI.logout()`
- `propertiesAPI.getAll()`, `propertiesAPI.create()`, `propertiesAPI.update()`, `propertiesAPI.delete()`
- `bookingsAPI.create()`, `bookingsAPI.getMyBookings()`
- `subscriptionsAPI.getPlans()`, `subscriptionsAPI.createOrder()`, `subscriptionsAPI.verifyPayment()`
- `leadsAPI.create()`
- `liveGroupingAPI.getAll()`, `liveGroupingAPI.create()`
- `complaintsAPI.create()`, `complaintsAPI.getMyComplaints()`
- `usersAPI.uploadProfilePhoto()`, `usersAPI.getStats()`

See `backend/README.md` for complete API documentation.
