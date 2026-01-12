# Live Grouping - Price Per Sq Ft & Token Amount Implementation

## Overview
Updated the Live Grouping module to:
1. Display **only price per sq ft** instead of total property prices
2. Calculate **token amount as 0.5% of discounted total property price**

## Token Amount Calculation

### Formula
```
Token Amount = (Group Price per Sq Ft × Property Area) × 0.5%
```

### Examples

**Property 1: Skyline Towers**
- Group Price: ₹4,690 / sq ft
- Area: 1450 sq ft
- Total Group Price: ₹4,690 × 1450 = ₹68,00,500
- Token Amount: ₹68,00,500 × 0.5% = **₹34,003**

**Property 2: Green Valley Phase 2**
- Group Price: ₹3,455 / sq ft
- Area: 2200 sq ft
- Total Group Price: ₹3,455 × 2200 = ₹76,01,000
- Token Amount: ₹76,01,000 × 0.5% = **₹38,005**

**Property 3: Royal Heights Premium**
- Group Price: ₹3,000 / sq ft
- Area: 3500 sq ft
- Total Group Price: ₹3,000 × 3500 = ₹1,05,00,000
- Token Amount: ₹1,05,00,000 × 0.5% = **₹52,500**

## Implementation Details

### 1. Utility Functions (`src/utils/liveGroupingCalculations.js`)

Created comprehensive calculation utilities:

```javascript
// Calculate token amount (0.5% of discounted total)
calculateTokenAmount(groupPricePerSqFt, area)

// Calculate total property price
calculateTotalPrice(pricePerSqFt, area)

// Calculate savings
calculateSavings(regularPricePerSqFt, groupPricePerSqFt, area)

// Format currency (₹X Lakhs / ₹X Cr)
formatCurrency(amount)

// Calculate discount percentage
calculateDiscountPercentage(regularPrice, groupPrice)
```

### 2. Property Card Display (LiveGrouping.jsx)

**Join Group Alert:**
```
Joining group for Skyline Towers!

Token Amount: ₹34,003 (0.5% of discounted price)
You'll save 9% OFF by joining this group buy.
```

### 3. Property Details Page (LiveGroupingDetails.jsx)

**Token Amount Display:**
```
┌─────────────────────────────────┐
│ Group Details                   │
├─────────────────────────────────┤
│ Token Amount:                   │
│ ₹34,003                         │
│ (0.5% of discounted price)      │
├─────────────────────────────────┤
│ Closing Date: Dec 20, 2025      │
│ Refund Policy: 100% refund...   │
└─────────────────────────────────┘
```

**Join Button Alert:**
```
Joining group for Skyline Towers!

Token Amount: ₹34,003 (0.5% of discounted price)
Total Group Price: ₹68.01 Lakhs
You'll save ₹7.00 Lakhs by joining this group buy.
```

## Changes Made

### Files Created:
1. ✅ `src/utils/liveGroupingCalculations.js`
   - Token amount calculation
   - Price calculation utilities
   - Currency formatting
   - Discount percentage calculation

### Files Modified:
1. ✅ `src/pages/Exhibition/LiveGrouping.jsx`
   - Imported calculation utilities
   - Updated `handleJoinGroup` to calculate token dynamically
   - Shows formatted token amount in alert

2. ✅ `src/pages/Exhibition/LiveGroupingDetails.jsx`
   - Imported calculation utilities
   - Removed hardcoded token amounts from fallback data
   - Updated token display to calculate dynamically
   - Enhanced join alert with detailed pricing info

3. ✅ `src/pages/Exhibition/LiveGroupingDetails.css`
   - Added `.token-highlight` styling (green, bold)
   - Added `.token-note` styling (small, italic)
   - Enhanced visual hierarchy for token amount

## Display Format

### Property Card
- Shows per sq ft pricing only
- Join button triggers alert with calculated token

### Property Details Page
```
Token Amount: ₹34,003
(0.5% of discounted price)
```

## Currency Formatting

Amounts are automatically formatted for readability:
- < ₹1 Lakh: ₹34,003
- ₹1-99 Lakhs: ₹68.01 Lakhs
- ≥ ₹1 Crore: ₹1.05 Cr

## Benefits

1. **Dynamic Calculation**: Token amount automatically calculated based on property price
2. **Transparency**: Users see exactly 0.5% of discounted price
3. **Consistency**: Same calculation logic across all properties
4. **Flexibility**: Easy to adjust percentage if needed
5. **Accuracy**: No manual token amount entry required

## Testing Checklist

- ✅ Token amount calculates as 0.5% of (group price × area)
- ✅ Currency formatting works correctly
- ✅ Token displays in property details
- ✅ Join alerts show calculated token
- ✅ All calculations are accurate
- ✅ Mobile responsive design maintained
- ✅ No hardcoded token amounts

## Future Enhancements

1. Add token amount to property cards
2. Show token refund timeline
3. Add payment gateway integration for token
4. Display token amount breakdown
5. Add token amount to booking confirmation

## Notes

- Token amount is always 0.5% of discounted total price
- Calculation is automatic and dynamic
- No manual token entry needed in database
- Currency formatting handles lakhs and crores
- All amounts rounded to nearest rupee

## Changes Implemented

### 1. Data Structure Update
Changed from total price to per sq ft pricing:

**Before:**
```javascript
{
  originalPrice: "₹75 Lakhs",
  groupPrice: "₹68 Lakhs",
  savings: "₹7 Lakhs"
}
```

**After:**
```javascript
{
  pricePerSqFt: 5172,        // Regular price per sq ft
  groupPricePerSqFt: 4690,   // Group discounted price per sq ft
  area: "1450 sq.ft"         // Property area for reference
}
```

### 2. Property Card Display (LiveGrouping.jsx)
**Updated Pricing Section:**
- ✅ Shows Regular Price per sq ft (muted/strikethrough)
- ✅ Shows Live Grouping Price per sq ft (highlighted in green)
- ✅ Added note: "Final price depends on total area selected"
- ❌ Removed total price displays
- ❌ Removed savings amount

**Visual Design:**
- Regular price: Gray, strikethrough, smaller font
- Group price: Green gradient background, larger font, bold
- Label: "🎯 Live Grouping Price" for clarity

### 3. Property Details Page (LiveGroupingDetails.jsx)
**Updated Pricing Card:**
- ✅ Dedicated pricing section with per sq ft rates
- ✅ Clear distinction between regular and group prices
- ✅ Added informational note about final pricing
- ✅ Shows property area for reference
- ❌ Removed total price calculations
- ❌ Removed savings highlight section

**Pricing Note Includes:**
- "Final price depends on total area selected"
- Property area display
- Clear visual hierarchy

### 4. CSS Styling Updates

**LiveGrouping.css:**
```css
.group-highlight {
  color: #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  padding: 8px 12px;
  border-radius: 8px;
}

.savings-note {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 8px;
  background: #f0f4ff;
  border-radius: 6px;
  border: 1px dashed #c7d2fe;
}
```

**LiveGroupingDetails.css:**
```css
.pricing-note {
  padding: 16px;
  background: #f0f4ff;
  border-radius: 10px;
  border: 1px dashed #c7d2fe;
}

.group-price-large {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #10b981;
}
```

## Display Format

### Property Card (List View)
```
Regular Price
₹5,172 / sq ft (strikethrough, gray)

🎯 Live Grouping Price
₹4,690 / sq ft (green highlight)

💡 Final price depends on total area selected
```

### Property Details Page
```
┌─────────────────────────────────┐
│ Regular Price                   │
│ ₹5,172 / sq ft (strikethrough) │
├─────────────────────────────────┤
│ 🎯 Live Grouping Price          │
│ ₹4,690 / sq ft (highlighted)   │
├─────────────────────────────────┤
│ 💡 Note: Final price depends    │
│    on total area selected       │
│ Property Area: 1450 sq.ft       │
└─────────────────────────────────┘
```

## Benefits

1. **Transparency**: Users see exact per sq ft rates
2. **Flexibility**: Final price calculated based on actual area
3. **Clarity**: No confusion about total vs per sq ft pricing
4. **Consistency**: Same format across all live grouping views
5. **Mobile Friendly**: Compact display works well on small screens

## Example Calculations

For a 1450 sq ft property:
- Regular: ₹5,172/sq ft
- Group: ₹4,690/sq ft
- Savings: ₹482/sq ft
- Total Regular: ₹75,00,000 (calculated by user)
- Total Group: ₹68,00,000 (calculated by user)

## Files Modified

1. ✅ `src/pages/Exhibition/LiveGrouping.jsx`
   - Updated fallback data structure
   - Modified pricing display component

2. ✅ `src/pages/Exhibition/LiveGrouping.css`
   - Added `.group-highlight` styling
   - Added `.savings-note` styling
   - Updated `.price-comparison` layout

3. ✅ `src/pages/Exhibition/LiveGroupingDetails.jsx`
   - Updated fallback data structure
   - Modified pricing card display
   - Added pricing note section

4. ✅ `src/pages/Exhibition/LiveGroupingDetails.css`
   - Updated `.price-comparison-large` styling
   - Added `.pricing-note` styling
   - Enhanced `.group-price-large` styling

## Testing Checklist

- ✅ Property cards show per sq ft pricing only
- ✅ Details page shows per sq ft pricing only
- ✅ No total prices visible anywhere
- ✅ Green highlight on group price
- ✅ Strikethrough on regular price
- ✅ Informational note displays correctly
- ✅ Mobile responsive design maintained
- ✅ Currency format: ₹X,XXX / sq ft

## Future Enhancements

1. Add calculator tool for users to compute total based on area
2. Show discount percentage per sq ft
3. Add comparison with market rates
4. Dynamic pricing based on group size
5. Real-time price updates as group fills

## Notes

- All pricing now strictly per sq ft
- Total prices removed from display
- Users calculate final amount based on their required area
- Maintains clean, minimal UI
- Consistent across desktop and mobile
