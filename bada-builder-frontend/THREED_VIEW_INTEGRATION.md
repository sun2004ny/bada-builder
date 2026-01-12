# 3D View Integration - Live Grouping

## Overview
Integrated 3D view functionality into the Live Grouping module. Users can access the interactive 3D model by clicking the "Join This Group" button on any Live Grouping property.

## Changes Made

### 1. LiveGroupingDetails Page
**File**: `src/pages/Exhibition/LiveGroupingDetails.jsx`
- **Removed**: Separate "View 3D Model" button
- **Updated**: "Join This Group" button now navigates to 3D view
- Button navigates to `/exhibition/3d-view` with property data

### 2. LiveGrouping Listing Page
**File**: `src/pages/Exhibition/LiveGrouping.jsx`
- "Join This Group" button navigates to `/exhibition/3d-view`
- Fixed navigation path to use correct route

### 3. Routing
**File**: `src/App.jsx`
- Route: `/exhibition/3d-view` → `<ThreeDView />`
- ThreeDView component enabled

## User Flow

### From Live Grouping Listing
1. User browses Live Grouping properties
2. Clicks "Join This Group" button on any property card
3. Navigates directly to interactive 3D view

### From Property Details
1. User views Live Grouping property details
2. Reviews pricing, benefits, and amenities
3. Clicks "Join This Group" button in pricing card
4. Navigates directly to interactive 3D view

## Button Behavior

**"Join This Group" Button:**
- Active groups: Opens 3D view for unit selection and booking
- Closing groups: Shows "⚡ Join Now - Closing Soon!" and opens 3D view
- Closed groups: Disabled with "❌ Group Closed" text

## 3D View Features
- Interactive 3D visualization of property towers
- Click on individual units to see details
- Real-time status updates (Available/Booked/Hold)
- Direct booking with Razorpay integration
- 0.5% advance payment calculation
- Unit hold functionality
- Color-coded units:
  - Green: Available
  - Red: Booked
  - Yellow: On Hold
  - Amber: Shops
  - Slate: Parking

## Technical Details

### Route
- Path: `/exhibition/3d-view`
- Component: `ThreeDView`
- State passed: `{ property: propertyObject }`

### Dependencies
- `@react-three/fiber` - 3D rendering
- `@react-three/drei` - 3D helpers (OrbitControls, Sky, Text)
- `three` - Three.js library
- Firebase Firestore - Real-time unit status
- Razorpay - Payment integration

## Files Modified
1. `src/pages/Exhibition/LiveGroupingDetails.jsx` - Updated Join button to navigate to 3D view
2. `src/pages/Exhibition/LiveGrouping.jsx` - Join button navigates to 3D view
3. `src/App.jsx` - Added route and import

## Removed
- Separate "View 3D Model" button from LiveGroupingDetails page
- `.threed-view-btn` CSS class (no longer needed)
