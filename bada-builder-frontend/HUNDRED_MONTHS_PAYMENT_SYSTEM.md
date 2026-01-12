# 100 Months Payment Plan System

## Overview
A comprehensive flexible payment system allowing buyers to purchase properties by paying a booking amount upfront and the remaining amount in 100 equal monthly installments with no interest.

## System Architecture

### Phase 1: Landing Page & Basic Structure ✅
- **Status**: Implemented
- **Features**:
  - Hero section with key benefits
  - How it works (4-step process)
  - Benefits showcase (6 key benefits)
  - Available properties listing
  - FAQ section
  - CTA section
- **Files Created**:
  - `src/pages/PaymentPlans/HundredMonths.jsx`
  - `src/pages/PaymentPlans/HundredMonths.css`
  - `src/utils/paymentPlanCalculations.js`
- **Navigation**: Added to header (desktop & mobile) as "💰 100 Months"

### Phase 2: Property Integration (To Be Implemented)
**Required Components**:
1. Property Details Page with Payment Plan Selector
2. Payment Breakdown Modal
3. Legal Consent & Terms Modal
4. Payment Gateway Integration

**Database Collections Needed**:
```javascript
// paymentPlans collection
{
  planId: string,
  userId: string,
  propertyId: string,
  planType: "100_months",
  totalAmount: number,
  bookingPaid: number,
  monthlyAmount: number,
  paidMonths: number,
  pendingMonths: number,
  nextDueDate: timestamp,
  status: "active" | "delayed" | "defaulted" | "completed",
  createdAt: timestamp,
  updatedAt: timestamp
}

// installments collection
{
  installmentId: string,
  planId: string,
  monthNumber: number,
  amount: number,
  dueDate: timestamp,
  paidDate: timestamp | null,
  status: "pending" | "paid" | "overdue",
  lateFee: number,
  paymentId: string | null
}

// propertyPayments collection
{
  paymentId: string,
  planId: string,
  installmentId: string,
  userId: string,
  amount: number,
  paymentMethod: string,
  razorpayPaymentId: string,
  status: "success" | "failed",
  timestamp: timestamp
}
```

### Phase 3: User Dashboard (To Be Implemented)
**Profile → My Payment Plans**:
- Active plans list
- Payment progress bars
- Next due date & amount
- Status badges (Active/Delayed/Defaulted/Completed)
- Payment history button
- Quick pay button

### Phase 4: Admin Dashboard (To Be Implemented)
**Admin Panel Features**:
1. Payment Plan Configuration per Property
   - Enable/disable 100-month plan
   - Set minimum booking amount
   - Configure grace period
   - Set late fee rules
   - Define default threshold

2. Dashboard Views
   - Active customers list
   - Paid vs pending installments
   - Monthly inflow projection
   - Defaulters & alerts
   - Property-wise outstanding balance

3. Manual Controls
   - Mark installment as paid
   - Pause payment plan
   - Cancel plan on default
   - Reassign unit
   - Generate payment statement (PDF)

### Phase 5: Automation & Notifications (To Be Implemented)
**Automated Systems**:
1. Installment Generation
   - Auto-generate 100 installment records on plan activation
   - Assign due dates month-wise

2. Reminder System
   - 5 days before due date
   - On due date
   - After grace period
   - Delivery: Email + In-app notifications

3. Default Handling
   - Auto-mark as "Defaulted" after threshold
   - Notify admin
   - Release/reassign property
   - Update booking chart

## Calculation Logic

### Auto-Calculations
```javascript
Total Property Value = Area × Price per sq ft
Remaining Amount = Total Value − Booking Amount
Monthly Installment = Remaining Amount ÷ 100
```

### Payment Dates
```javascript
Start Date = Booking Date + 1 month
End Date = Start Date + 100 months
```

### Late Fee Calculation
```javascript
Late Fee = Monthly Installment × 2% (if overdue after grace period)
```

### Ownership Percentage
```javascript
Ownership % = (Total Paid / Total Value) × 100
```

## Status Mapping

### Property Status in Booking Chart
- **Available** → Green
- **On 100-Month Plan** → Yellow
- **Fully Paid** → Red (Sold)
- **Defaulted** → Grey

### Payment Plan Status
- **Active**: All payments on time
- **Delayed**: 1-2 missed payments
- **Defaulted**: 3+ missed payments
- **Completed**: All 100 installments paid

## User Flow

### 1. Property Selection
1. User browses properties with 100-month plan option
2. Clicks "View Payment Plan"
3. Sees detailed breakdown:
   - Total property value
   - Booking amount required
   - Monthly installment amount
   - Payment timeline
   - Terms & conditions

### 2. Plan Activation
1. User selects "100 Months Payment Plan"
2. Reviews payment breakdown modal
3. Accepts legal consent (mandatory checkbox)
4. Pays booking amount via Razorpay
5. System generates 100 installment records
6. Property status updates to "On 100-Month Plan" (Yellow)

### 3. Monthly Payments
1. User receives reminder 5 days before due date
2. Logs into dashboard
3. Views "My Payment Plans"
4. Clicks "Pay Now" on next due installment
5. Completes payment via Razorpay
6. System updates:
   - Installment status to "paid"
   - Payment progress bar
   - Next due date

### 4. Completion
1. After 100th payment
2. Status changes to "Completed"
3. Full ownership rights transferred
4. Property status updates to "Fully Paid" (Red)

## Legal & Safety

### India-Ready Compliance
1. **Disclaimer**: "Ownership transfers only after X% payment"
2. **Agreement Reference ID**: Unique ID for each plan
3. **Payment Acknowledgment Logs**: All payments tracked
4. **Non-Transfer Clause**: Until admin approval
5. **Forfeiture Rules**: Visible to user before acceptance

### Terms & Conditions
- Payment schedule
- Late payment & default rules
- Cancellation & forfeiture terms
- Ownership transfer conditions
- Grace period details
- Prepayment options

## Scalability

### Future Plans Support
System designed to support:
- 60 months plan
- 120 months plan
- Custom plans per developer
- Rental-adjusted installment models

### Dynamic Configuration
- No hardcoded "100" anywhere
- Plan duration stored in database
- Calculations use `planDuration` variable
- Easy to add new plan types

## UI/UX Guidelines

### Design Principles
- Clean, minimal, finance-style UI
- Progress bars instead of tables
- Color codes:
  - **Paid** → Green
  - **Upcoming** → Yellow
  - **Overdue** → Red
- Mobile-first & responsive
- No clutter, no finance jargon overload

### Key Components
1. Payment Progress Bar
2. Next Due Card
3. Payment History Timeline
4. Status Badges
5. Quick Pay Button
6. Breakdown Modal

## Implementation Status

### ✅ Completed
- Landing page with hero section
- How it works section
- Benefits showcase
- Properties listing structure
- FAQ section
- Navigation integration (header menu)
- Calculation utilities
- Basic routing

### 🚧 In Progress
- Property details integration
- Payment plan selector
- Breakdown modal

### 📋 To Do
- Legal consent modal
- Razorpay integration for installments
- User dashboard (My Payment Plans)
- Admin dashboard
- Automation & reminders
- Email notifications
- PDF statement generation
- Default handling system
- Property status integration with booking chart

## Database Indexes Required

```javascript
// Firestore indexes
paymentPlans:
  - userId, status
  - propertyId, status
  - nextDueDate (ascending)

installments:
  - planId, status
  - dueDate (ascending)
  - status, dueDate

propertyPayments:
  - userId, timestamp (descending)
  - planId, timestamp (descending)
```

## API Endpoints Needed

### Payment Gateway
- `/api/payment/create-order` - Create Razorpay order for installment
- `/api/payment/verify` - Verify payment signature
- `/api/payment/webhook` - Handle payment webhooks

### Admin APIs
- `/api/admin/payment-plans` - List all plans
- `/api/admin/mark-paid` - Manually mark installment as paid
- `/api/admin/cancel-plan` - Cancel a payment plan
- `/api/admin/generate-statement` - Generate PDF statement

## Testing Checklist

### User Flow
- [ ] Browse properties with 100-month option
- [ ] View payment breakdown
- [ ] Accept terms & conditions
- [ ] Pay booking amount
- [ ] View plan in dashboard
- [ ] Pay monthly installment
- [ ] Receive payment reminders
- [ ] View payment history
- [ ] Complete all payments

### Admin Flow
- [ ] Configure payment plan for property
- [ ] View active plans dashboard
- [ ] Mark installment as paid manually
- [ ] Handle defaulted plans
- [ ] Generate payment statements
- [ ] View analytics & reports

### Edge Cases
- [ ] Missed payment handling
- [ ] Grace period expiry
- [ ] Default threshold reached
- [ ] Prepayment scenario
- [ ] Plan cancellation
- [ ] Property reassignment

## Next Steps

1. **Immediate**: Create property details page with payment plan selector
2. **Short-term**: Implement user dashboard for payment tracking
3. **Medium-term**: Build admin dashboard for plan management
4. **Long-term**: Add automation, reminders, and advanced analytics

## Notes
- All calculations are interest-free
- Grace period: 5 days (configurable)
- Default threshold: 3 missed payments (configurable)
- Prepayment allowed without penalties
- Ownership transfer after 100% payment completion
