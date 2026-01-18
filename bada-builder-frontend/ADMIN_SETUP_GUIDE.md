# Admin Panel Setup Guide

## Overview
The new admin panel has been successfully integrated into the Bada Builder frontend application. It provides a modern, dark-mode interface for managing users, properties, and system activities.

## Admin Access
- **URL**: `/admin`
- **Admin Credentials**: 
  - Email: `sunny260604@gmail.com`
  - Password: `admin@123`
- **User Type**: Must be `admin` in the database

## Features

### 1. Dashboard (`/admin`)
- Overview statistics (users, properties, revenue)
- Recent activity feed
- Quick action items
- Real-time data refresh

### 2. User Management (`/admin/users`)
- View all users with filtering and search
- User status management (active/suspended)
- Bulk operations support
- User details modal with complete information

### 3. Property Approval (`/admin/properties`)
- Review pending property submissions
- Approve or reject properties with reasons
- Property details modal with images and amenities
- Status filtering (pending, approved, rejected)

### 4. Audit Logs (`/admin/audit`)
- System activity monitoring
- User action tracking
- Detailed log entries with IP addresses and user agents
- Export functionality for compliance
- Advanced filtering by date range and action type

## Technical Implementation

### Authentication
- Uses existing AuthContext for user authentication
- Checks `user_type === 'admin'` for access control
- Redirects non-admin users to login page
- Supports both `user_type` and `userType` field formats

### API Integration
- Uses `adminAPI` service for backend communication
- Graceful fallback to mock data when backend endpoints are unavailable
- Error handling with user-friendly messages
- Optimistic UI updates for better user experience

### UI/UX Features
- Dark mode support with localStorage persistence
- Responsive design for mobile and desktop
- Modern sidebar navigation
- Loading states and skeleton screens
- Modal dialogs for detailed views
- Toast notifications for actions

## Backend Requirements

The admin panel currently uses mock data but is designed to integrate with these backend endpoints:

```javascript
// Dashboard
GET /api/admin/stats/users
GET /api/admin/stats/properties
GET /api/admin/dashboard

// User Management
GET /api/admin/users
PATCH /api/admin/users/:id/status
GET /api/admin/users/:id

// Property Management
GET /api/admin/properties
PATCH /api/admin/properties/:id/approve
PATCH /api/admin/properties/:id/reject

// Audit Logs
GET /api/admin/audit-logs
```

## Database Setup

### Option 1: Using SQL Script (Manual)
Run the SQL commands in your database:
```sql
-- Execute the commands in CREATE_ADMIN_USER.sql (located in root directory)
```

### Option 2: Using Node.js Script (Automated)
```bash
cd bada-builder-backend
npm run create-admin
```

## File Structure

```
/ (root)
├── CREATE_ADMIN_USER.sql          # SQL script for manual admin user creation
├── SQL_SETUP_COMMANDS.sql         # Main database setup
└── bada-builder-backend/
    └── scripts/
        └── create-admin.js         # Node.js script for automated admin creation
```

## Security Considerations

1. **Access Control**: Only users with `user_type = 'admin'` can access admin routes
2. **Session Management**: Uses existing JWT authentication
3. **Route Protection**: All admin routes are protected by authentication middleware
4. **Data Validation**: Input validation on all forms and API calls
5. **Audit Trail**: All admin actions should be logged for compliance

## Migration from Old Admin Panel

The old admin panel (`/admin-panel/*`) has been removed and replaced with:
- Modern React components with TypeScript support
- Tailwind CSS for consistent styling
- Lucide React icons for better performance
- Improved accessibility and mobile responsiveness

Legacy routes automatically redirect to the new admin panel.

## Development Notes

- All components are in `src/pages/Admin/`
- API service is in `src/services/adminApi.js`
- Uses existing AuthContext for authentication
- Follows the same patterns as other pages in the application
- Dark mode state is persisted in localStorage as `adminDarkMode`

## Testing

To test the admin panel:
1. Ensure the admin user exists in the database
2. Login with admin credentials
3. Navigate to `/admin`
4. Test all features with mock data
5. Verify authentication protection works for non-admin users

## Future Enhancements

1. Real-time notifications for admin actions
2. Advanced analytics and reporting
3. Bulk user operations
4. Property management workflows
5. System configuration management
6. Role-based permissions (super admin, moderator, etc.)