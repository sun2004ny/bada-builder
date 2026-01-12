# Data Centre Investment Module - Complete Specification

## Overview
A comprehensive investment vertical allowing users to invest in data centre infrastructure, track returns, and manage their portfolio.

## Module Structure

### 1. Navigation Updates
- Main "Investments" page updated with two categories:
  - Real Estate (existing)
  - Data Centres (new)

### 2. Pages Created
1. **DataCentreInvestments.jsx** - Main listing page
2. **DataCentreDetails.jsx** - Detailed project page
3. **DataCentrePortfolio.jsx** - User's data centre investments
4. **AdminDataCentres.jsx** - Admin management panel

### 3. Database Collections

#### `dataCentreProjects`
```javascript
{
  projectId: string,
  name: string,
  city: string,
  country: string,
  tier: "Tier II" | "Tier III" | "Tier IV",
  totalCapacity: number, // MW
  pue: number, // Power Usage Effectiveness
  tenantType: "Hyperscale" | "Enterprise" | "Mixed",
  minimumInvestment: number,
  expectedAnnualReturns: number, // percentage
  investmentTenure: number, // years
  riskLevel: "Low" | "Medium" | "High",
  status: "Live" | "Fully Funded" | "Coming Soon",
  
  // Overview
  description: string,
  operatorName: string,
  ownershipStructure: string,
  commissioningDate: timestamp,
  totalProjectCost: number,
  fundedAmount: number,
  remainingAmount: number,
  
  // Technical
  redundancy: string, // N, N+1, 2N
  coolingType: string,
  connectivity: array,
  compliance: array,
  
  // Financials
  targetIRR: number,
  annualYield: number,
  cashflowFrequency: "Monthly" | "Quarterly",
  lockInPeriod: number, // months
  exitOptions: array,
  managementFee: number,
  performanceFee: number,
  
  // Tenants & Revenue
  tenants: array,
  leaseType: string,
  averageLeaseDuration: number,
  revenueType: array,
  
  // Risk
  risks: array,
  
  images: array,
  documents: array,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `dataCentreInvestments`
```javascript
{
  investmentId: string,
  userId: string,
  projectId: string,
  investmentAmount: number,
  investmentDate: timestamp,
  currentValue: number,
  totalReturnsEarned: number,
  status: "Active" | "Exited" | "Locked",
  payoutHistory: array,
  documents: array,
  razorpayPaymentId: string,
  agreementUrl: string
}
```

#### `dataCentrePayouts`
```javascript
{
  payoutId: string,
  investmentId: string,
  userId: string,
  amount: number,
  payoutDate: timestamp,
  type: "Monthly" | "Quarterly" | "Annual",
  status: "Paid" | "Pending"
}
```

### 4. Features Implemented

#### Listing Page
- Grid view of all data centre projects
- Advanced filters:
  - Location
  - Tier (II, III, IV)
  - Minimum Investment
  - Returns %
  - Risk Level
  - Tenure
- Search functionality
- Sort by: Returns, Investment Amount, Tenure

#### Details Page
Structured sections:
1. **Overview** - Project description, operator, ownership
2. **Technical Details** - Tier, capacity, redundancy, compliance
3. **Financials** - Investment calculator, IRR, yield, fees
4. **Tenants & Revenue** - Tenant list, lease info, revenue model
5. **Risk & Mitigation** - Risk factors and mitigation strategies
6. **Documents** - Legal documents, reports

#### Investment Flow
1. User clicks "Invest Now"
2. Investment calculator shows:
   - Investment amount (adjustable)
   - Expected annual income
   - Total returns at exit
3. Payment via Razorpay (UPI/Net Banking/Bank Transfer)
4. Digital agreement generated (PDF)
5. Investment recorded in Firestore
6. Confirmation email sent

#### User Portfolio
- Dashboard showing:
  - Total invested amount
  - Current portfolio value
  - Total returns earned
  - Monthly/Quarterly payout history
  - Performance graphs (Recharts)
  - Download documents
  - Exit options

#### Admin Panel
- Add/Edit/Delete projects
- Upload documents
- Update financial parameters
- Real-time funding progress
- Pause/Close investments
- Push performance updates
- Manage payouts
- View investor list

### 5. Legal & Compliance
- Disclaimer displayed prominently
- KYC mandatory before investment
- PAN verification required
- AML compliance
- Digital agreement with e-signature
- Risk disclosure document
- Compliance badges (ISO, SOC, etc.)

### 6. UI/UX Features
- Premium institutional design
- Dark mode compatible
- Framer Motion animations
- Mobile-first responsive
- Interactive charts (Recharts)
- Progress indicators
- Status badges
- Color-coded risk levels

### 7. Security Features
- User authentication required
- KYC verification
- Secure payment gateway
- Encrypted document storage
- Transaction logging
- Audit trail

### 8. Notifications
- Investment confirmation
- Payout notifications
- Performance updates
- Document uploads
- Exit opportunity alerts

### 9. Analytics & Reporting
- Investment performance tracking
- ROI calculations
- Payout history
- Tax documents (Form 16A)
- Annual statements

### 10. Scalability
- Modular architecture
- Reusable components
- Configurable parameters
- Multi-currency support ready
- API-ready structure

## Implementation Phases

### Phase 1: Foundation ✅
- Update Investments page navigation
- Create basic listing page
- Set up routing

### Phase 2: Core Features ✅
- Data centre listing with filters
- Details page with all sections
- Investment calculator
- Payment integration (ready for Razorpay)

### Phase 3: User Features (Next)
- Portfolio dashboard
- Payout tracking
- Document management
- Performance graphs

### Phase 4: Admin Features
- Admin panel
- Project management
- Payout management
- Investor management

### Phase 5: Advanced Features
- Automated payouts
- Email notifications
- Tax documents
- Exit marketplace

## Tech Stack
- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage, Functions)
- **Payments**: Razorpay
- **Charts**: Recharts
- **PDF**: jsPDF / react-pdf
- **Forms**: React Hook Form
- **Validation**: Yup

## Status: Phase 1 & 2 Complete, Phase 3 Ready to Start
