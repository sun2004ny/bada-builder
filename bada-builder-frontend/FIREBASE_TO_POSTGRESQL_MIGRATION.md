# Firebase to PostgreSQL Migration Guide

This document outlines the changes made to migrate from Firebase to PostgreSQL backend with JWT authentication.

## ✅ Completed Changes

### Core Infrastructure
1. **Created API Service** (`src/services/api.js`)
   - Centralized API communication
   - JWT token management
   - File upload handling

2. **Updated AuthContext** (`src/context/AuthContext.jsx`)
   - Replaced Firebase auth with JWT
   - Uses localStorage for token persistence
   - API-based user profile fetching

3. **Updated Login Page** (`src/pages/Login.jsx`)
   - Uses `authAPI.register()` and `authAPI.login()`
   - Removed Firebase imports

4. **Updated LeadModal** (`src/components/LeadModal/LeadModal.jsx`)
   - Uses `leadsAPI.create()`

5. **Updated Header** (`src/components/Header/Header.jsx`)
   - Uses `logout()` from AuthContext

6. **Updated MyProperties** (`src/pages/MyProperties.jsx`)
   - Uses `propertiesAPI.getMyProperties()` and `propertiesAPI.delete()`

## 🔄 Files That Need Updates

### High Priority (Core Features)

1. **PostProperty.jsx**
   - Replace `addDoc(collection(db, 'properties'))` with `propertiesAPI.create()`
   - Replace `updateDoc(doc(db, 'properties', id))` with `propertiesAPI.update()`
   - Remove Firebase imports

2. **PropertyDetails.jsx**
   - Replace `getDoc(doc(db, 'properties', id))` with `propertiesAPI.getById(id)`

3. **BookSiteVisit.jsx**
   - Replace `addDoc(collection(db, 'bookings'))` with `bookingsAPI.create()`

4. **MyBookings.jsx**
   - Replace Firestore queries with `bookingsAPI.getMyBookings()`

5. **SubscriptionPlans.jsx, IndividualPlan.jsx, DeveloperPlan.jsx**
   - Replace Firestore updates with `subscriptionsAPI.createOrder()` and `subscriptionsAPI.verifyPayment()`

6. **ProfilePage.jsx**
   - Replace `updateDoc()` with `usersAPI.uploadProfilePhoto()`
   - Replace Firestore queries with `usersAPI.getStats()`

### Medium Priority

7. **Exhibition Pages** (ByIndividual.jsx, ByDeveloper.jsx, LiveGrouping.jsx)
   - Replace Firestore queries with `propertiesAPI.getAll()` or `liveGroupingAPI.getAll()`

8. **AdminLiveGrouping.jsx**
   - Replace Firestore operations with `liveGroupingAPI.create()`, `liveGroupingAPI.update()`

9. **Complaints** (RegisterComplaint.jsx, MyComplaints.jsx)
   - Replace Firestore operations with `complaintsAPI.create()`, `complaintsAPI.getMyComplaints()`

10. **LongLivePost.jsx, LongLiveBrowse.jsx**
    - Replace Firestore operations with appropriate API calls

11. **ShortStayLanding.jsx**
    - Replace Firestore queries with API calls

12. **HomeLoans.jsx**
    - Replace Firestore operations with API calls

13. **InvestmentDetails.jsx, MyInvestments.jsx**
    - Replace Firestore operations with API calls (if backend supports)

14. **ThreeDView.jsx**
    - Replace Firestore operations with API calls

15. **RecommendedProjects.jsx**
    - Replace Firestore queries with `propertiesAPI.getAll()`

### Low Priority (Utilities)

16. **propertyExpiry.js**
    - Update to use API instead of Firestore `updateDoc()`

17. **subscriptionService.js**
    - Replace all Firestore operations with `subscriptionsAPI` calls

18. **chatService.js**
    - Replace Firestore operations with API calls (if backend supports chat)

## 🔧 Common Migration Patterns

### Pattern 1: Reading Data
**Before (Firebase):**
```javascript
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const q = query(collection(db, 'properties'), where('status', '==', 'active'));
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**After (API):**
```javascript
import { propertiesAPI } from '../services/api';

const response = await propertiesAPI.getAll({ status: 'active' });
const data = response.properties;
```

### Pattern 2: Creating Data
**Before (Firebase):**
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

await addDoc(collection(db, 'bookings'), bookingData);
```

**After (API):**
```javascript
import { bookingsAPI } from '../services/api';

await bookingsAPI.create(bookingData);
```

### Pattern 3: Updating Data
**Before (Firebase):**
```javascript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

await updateDoc(doc(db, 'properties', id), updateData);
```

**After (API):**
```javascript
import { propertiesAPI } from '../services/api';

await propertiesAPI.update(id, updateData);
```

### Pattern 4: Deleting Data
**Before (Firebase):**
```javascript
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

await deleteDoc(doc(db, 'properties', id));
```

**After (API):**
```javascript
import { propertiesAPI } from '../services/api';

await propertiesAPI.delete(id);
```

### Pattern 5: Real-time Listeners
**Before (Firebase):**
```javascript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const unsubscribe = onSnapshot(doc(db, 'users', userId), (snapshot) => {
  if (snapshot.exists()) {
    setData(snapshot.data());
  }
});
```

**After (API):**
```javascript
// Use polling or WebSocket if needed
useEffect(() => {
  const fetchData = async () => {
    const response = await api.getData();
    setData(response.data);
  };
  
  fetchData();
  const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
  return () => clearInterval(interval);
}, []);
```

### Pattern 6: File Uploads
**Before (Firebase Storage):**
```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

const storageRef = ref(storage, `path/${file.name}`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);
```

**After (API with Cloudinary):**
```javascript
import { usersAPI } from '../services/api';

const response = await usersAPI.uploadProfilePhoto(file);
const url = response.profilePhoto;
```

## 🗑️ Files to Remove

1. **src/firebase.jsx** - No longer needed
2. **firestore.rules** - No longer needed
3. **firestore.indexes.json** - No longer needed

## 📦 Package.json Updates

Remove Firebase dependencies:
```json
{
  "dependencies": {
    // Remove these:
    // "firebase": "^11.8.1"
  }
}
```

## 🔐 Environment Variables

Add to `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## ✅ Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Profile photo upload works
- [ ] Property creation works
- [ ] Property listing works
- [ ] Property update works (within 3 days)
- [ ] Property deletion works
- [ ] Lead generation works
- [ ] Site visit booking works
- [ ] Subscription purchase works
- [ ] Live grouping properties work
- [ ] Complaints system works

## 🚀 Next Steps

1. Update remaining files using the patterns above
2. Test all features thoroughly
3. Remove Firebase dependencies from package.json
4. Delete Firebase configuration files
5. Update environment variables
6. Deploy backend to production
7. Update frontend API URL for production
