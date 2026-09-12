# Technical Documentation
## Mall & Home Utility Services Aggregator

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (React + Vite)              │
│  Tailwind CSS · Lucide · Recharts · react-hot-toast  │
└────────────────────┬────────────────────────────────┘
                     │ HTTP REST (Axios)
                     │ /api/*
┌────────────────────▼────────────────────────────────┐
│               SERVER (Node.js + Express)             │
  status: String,          // pending|assigned|in_progress|completed|cancelled|rejected
  locationType: String,    // optional: residential | apartment | commercial | mall
└────────────────────┬────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────┐
│               DATABASE (MongoDB)                     │
│  Users · Providers · Bookings · Reviews · Disputes  │
└─────────────────────────────────────────────────────┘
```

---


## 2. Database Schema

### 2.1 User
```js
{
  name: String,          // required, max 100
  email: String,         // unique, lowercase
  password: String,      // bcrypt hashed, select: false
  role: String,          // enum: customer | provider | admin
  phone: String,
  avatar: String,
  address: {
    street, city, state, pincode
  },
  isActive: Boolean,     // default: true
}
```

### 2.2 ServiceProvider
```js
{
  userId: ObjectId,       // ref: User (unique)
  bio: String,
  serviceCategories: [],  // electrician|plumber|carpenter|tailor|maintenance
  skills: [String],
  experience: Number,
  pricing: {
    hourlyRate: Number,
    visitingCharge: Number,
    currency: String       // default: INR
  },
  location: {
    city, area, state, pincode,
    timezone: String,     // default: 'Asia/Kolkata'
    coordinates: { type: 'Point', coordinates: [lng, lat] }
  },
  isVerified: Boolean,
  verificationStatus: String,  // pending|under_review|approved|rejected
  verificationNote: String,
  documents: [{ type, filename, originalName, uploadedAt }],
  isAvailable: Boolean,
  availabilitySlots: [{ day, startTime, endTime }],
  rating: Number,         // 0–5, auto-updated
  totalReviews: Number,
  totalEarnings: Number,
  completedJobs: Number,
  timestamps: true
}
// Indexes: location.coordinates (2dsphere), verificationStatus+city, serviceCategories+verificationStatus, rating DESC
```

### 2.3 Booking
```js
{
  customerId: ObjectId,    // ref: User
  providerId: ObjectId,    // ref: ServiceProvider
  serviceCategory: String,
  serviceDescription: String,
  bookingType: String,     // instant | scheduled
  scheduledAt: Date,
  serviceLocation: { address, city, area, pincode, landmark, locationType },
  status: String,          // pending|assigned|in_progress|completed|cancelled|rejected
  statusHistory: [{ status, changedAt, changedBy, note }],
  estimatedAmount: Number,
  finalAmount: Number,
  isReviewed: Boolean,
  cancelledBy: String,
  cancelReason: String,
  completedAt: Date,
  timestamps: true
}
```

`locationType` is optional for backward compatibility and accepts `residential`, `apartment`, `commercial`, or `mall`. Scheduled timestamps are stored as UTC dates; provider availability slots are interpreted in the provider's `location.timezone` (default `Asia/Kolkata`).

### 2.4 Review
```js
{
  bookingId: ObjectId,    // ref: Booking (unique)
  customerId: ObjectId,   // ref: User
  providerId: ObjectId,   // ref: ServiceProvider
  rating: Number,         // 1–5, required
  comment: String,
  serviceCategory: String,
  timestamps: true
}
// Post-save hook: auto-updates provider rating & totalReviews
```

### 2.5 Dispute
```js
{
  bookingId: ObjectId,
  raisedBy: ObjectId,
  raisedByRole: String,    // customer | provider
  subject: String,
  description: String,
  status: String,          // open|under_review|resolved|closed
  resolution: String,
  resolvedBy: ObjectId,
  resolvedAt: Date,
  timestamps: true
}
```

### 2.6 Category
```js
{
  name: String,            // electrician|plumber|carpenter|tailor|maintenance
  displayName: String,
  description: String,
  icon: String,
  basePrice: Number,
  pricingGuideline: String,
  isActive: Boolean,
  timestamps: true
}
```

---

## 3. API Authentication

All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

Token payload:
```json
{ "id": "<userId>", "iat": 1234567890, "exp": 1234567890 }
```

Role middleware:
```js
protect           // Verifies JWT, attaches req.user
authorize(...roles) // Checks role inclusion
```

---

## 4. File Upload

Document uploads handled by **Multer**:
- Max size: 5MB
- Allowed types: JPEG, PNG, PDF
- Storage: `server/uploads/documents/`
- Access: Protected — requires JWT auth (`/api/documents/:filename`)
- Only admin and providers can access verification documents
- Filename format: `{timestamp}-{random}.{ext}`

---

## 5. Frontend Architecture

### Component Hierarchy
```
App (Router)
├── PublicLayout (Navbar + Footer)
│   ├── LandingPage
│   ├── ServicesPage
│   ├── ProviderSearchPage
│   ├── ProviderProfilePage
│   ├── LoginPage
│   └── RegisterPage
│
└── DashboardLayout (Navbar + Sidebar)
    ├── Customer Routes (ProtectedRoute role=customer)
    │   ├── CustomerDashboard
    │   ├── BookingsListPage
    │   ├── BookingDetailPage
    │   ├── BookingFlowPage (3-step)
    │   ├── ServiceHistoryPage
    │   └── CustomerProfilePage
    │
    ├── Provider Routes (ProtectedRoute role=provider)
    │   ├── ProviderDashboard
    │   ├── ProviderJobsPage
    │   ├── JobDetailPage
    │   ├── AvailabilityPage
    │   ├── EarningsPage
    │   └── ProviderProfileEditPage
    │
    └── Admin Routes (ProtectedRoute role=admin)
        ├── AdminDashboard (KPIs)
        ├── AdminUsersPage
        ├── AdminProvidersPage (Verification)
        ├── AdminBookingsPage
        ├── AdminDisputesPage
        ├── AdminAnalyticsPage (Charts)
        └── AdminCategoriesPage
```

### State Management
- **AuthContext**: Global user state, login/logout, token management
- **Local state**: Page-level data fetching with `useState` + `useEffect`
- **Axios interceptors**: Auto-attach JWT, handle 401 globally

### Design System (Tailwind)
```
Brand Colors (Soft Modern Utility):
  aqua:        #ABDDDE  (primary actions, highlights)
  mint:        #CAF1DE  (secondary sections, success)
  pale-green:  #E1F8DC  (soft backgrounds)
  cream-yellow:#FEF9DC  (small accents)
  soft-peach:  #FFE7C8  (service tiles)
  warm-peach:  #F7D8BB  (borders, dividers)
  navy:        #0F2B3D  (nav, footer, headings)

Custom Classes:
  .btn-primary     - Navy CTA button
  .btn-secondary   - White outline button
  .btn-navy        - Deep navy button
  .btn-aqua        - Aqua accent button
  .btn-ghost       - Text-only button
  .btn-danger      - Red destructive button
  .card            - Base card with shadow
  .card-hover      - Card with hover shadow
  .form-input      - Styled form input
  .form-label      - Form field label
  .badge-*         - Status pill badges
  .status-*        - Booking status badges (static class map)
```

---

## 6. Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 12 salt rounds |
| JWT | Signed with env secret, 7d expiry |
| Route protection | Role-based middleware on every route |
| Route protection | Role-based middleware on every route |
| Input validation | express-validator + controller-level checks |
| Error sanitization | No stack traces in production |
| CORS | Only allows configured CLIENT_URL |
| File validation | Type and size checked in Multer |
| Document access | Protected route — no public /uploads |
| Price calculation | Server-side only — client price ignored |
| Dispute auth | Booking ownership verified before dispute creation |
| Role escalation | Admin role blocked at registration API |
| Env secrets | All in .env, excluded from git |

## 6.1 Notifications and conversion metric

Authenticated users can read and mark notifications through `GET /api/notifications`, `PATCH /api/notifications/:id/read`, and `PATCH /api/notifications/read-all`. Booking, provider verification, and dispute events create persistent records; no WebSockets are used.

Provider discovery supports optional browser geolocation coordinates. `GET /api/providers` accepts `latitude`, `longitude`, and `radiusKm` and uses the provider 2dsphere index for nearby results; no paid map SDK or hardcoded map key is used.

Admin `bookingConversionRate` is calculated as booking records divided by recorded provider-discovery events, expressed as a percentage. `providerDiscoveryEvents` is exposed alongside the KPI so the denominator is visible and a zero-event period reports 0 rather than an invented rate.

---

## 7. Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=https://mall-home-utility-services-aggregator.netlify.app
DNS_WORKAROUND=false
```

---

## 8. Running Locally

```bash
# 1. Configure a reachable MongoDB Atlas URI in server/.env

# 2. Start server (Terminal 1)
cd server
npm run dev    # runs on :5000

# 3. Seed database (first time only)
npm run seed

# 4. Start client (Terminal 2)
cd client
npm run dev    # runs on :5173
```

---

## 9. Deployment

### Frontend (Netlify)
1. Push code to GitHub
2. Connect repo to Netlify
3. Set root directory: `client`
4. Build command: `npm run build`
5. Output directory: `client/dist`
6. Set `VITE_API_URL=https://mall-home-utility-api.onrender.com/api`

### Backend (Render)
1. Connect repo to Render
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env variables

### Database (MongoDB Atlas)
1. Create free M0 cluster
2. Add connection IP to whitelist (0.0.0.0/0 for Render)
3. Get connection string
4. Update MONGO_URI in Render env vars

---

## 10. Seed Data Summary

The seed script creates:
- 1 Admin user
- 3 Customer users
- 5 Provider users with profiles
  - 4 approved/verified
  - 1 under_review
- 5 Service categories with pricing
- 3 Sample bookings (various statuses)
- 1 Sample review (5-star)
