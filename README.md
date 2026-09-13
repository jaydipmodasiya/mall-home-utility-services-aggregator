# 🔧 Mall & Home Utility Services Aggregator

> A full-stack platform connecting customers with verified local service professionals — electricians, plumbers, carpenters, tailors, and maintenance staff.

![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen) ![React](https://img.shields.io/badge/react-18-blue) ![MongoDB](https://img.shields.io/badge/database-MongoDB-green) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Features

### Customer
- Register / Login securely
- Browse 5 service categories
- Search providers by city, area, availability, rating
- Use browser location to find providers within an approximate nearby radius
- View provider profiles (skills, experience, pricing, reviews)
- Book instantly or schedule for later
- Track booking status through the booking timeline
- Submit ratings & reviews after completed services
- View complete service history

### Service Provider
- Register & create professional profile
- Upload identity & skill verification documents
- Set service offerings, pricing, and availability schedule
- Accept or reject incoming job requests
- Update job status: Assigned → In Progress → Completed
- View earnings dashboard & job history

### Admin
- Secure admin dashboard with KPIs
- Manage all users (activate/deactivate while preserving history)
- Review, approve or reject provider verification
- Monitor all bookings with filters
- Manage disputes with manual resolution
- Manage service categories
- View analytics with Recharts bar & pie charts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| File Upload | Multer |
| Notifications | Persistent in-app notifications for booking, verification, and dispute events |

---
## 📁 Project Structure

```
├── client/                   # React + Vite frontend
│   ├── src/
│   ├── components/           # Layout and reusable UI components
│   │   ├── layout/           # Navbar, Footer, Sidebar, Layout wrappers
│   │   └── ui/               # Shared states, dropdowns, avatars, badges
│   │   ├── context/          # AuthContext
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── customer/     # Dashboard, Search, Booking, Profile, History
│   │   │   ├── provider/     # Dashboard, Jobs, Availability, Earnings, Profile
│   │   │   └── admin/        # Dashboard, Users, Providers, Bookings, Disputes, Analytics
│   │   ├── services/         # Axios API client
│   │   └── utils/            # Constants, formatters
│   └── ...
│
├── server/                   # Node.js + Express backend
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Auth, Provider, Booking, Review, Dispute, Category, Admin
│   ├── middleware/            # JWT auth, validation, error handler
│   ├── models/               # User, ServiceProvider, Booking, Category, Review, Dispute, Notification
│   ├── routes/               # Express routers
│   ├── utils/                # Seed script and notification helper
│   └── server.js
│
├── docs/                     # PRD + Technical documentation
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas (or another reachable MongoDB deployment)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy and edit server/.env
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DNS_WORKAROUND=false
```

Create a frontend environment file for production deployments:
```bash
# client/.env.local
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ **Security**: Never commit `.env` files. Keep secrets out of source control and set them in your hosting platform.

### 3. Seed the Database

```bash
cd server
npm run seed
```

This resets categories, users, providers, bookings, reviews, notifications, and provider-discovery records, then creates:
- **Admin**: `admin@mallutility.in` / `Admin@1234`
- **Customer**: `priya@example.com` / `Test@1234`
- **Provider**: `ravi@example.com` / `Test@1234`
- 5 provider profiles, sample bookings & reviews, and valid provider coordinates

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# → http://localhost:5173
```

> The frontend reads `VITE_API_URL` in production and falls back to `/api` for local Vite proxy requests. Local development continues through the Vite proxy while deployed clients call the Render backend directly.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mallutility.in | Admin@1234 |
| Customer | priya@example.com | Test@1234 |
| Provider | ravi@example.com | Test@1234 |

> 💡 The Login page has one-click demo credential buttons!

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register user (customer/provider only) |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/me` | ✅ | Update profile |
| PATCH | `/api/auth/change-password` | ✅ | Change password |

### Providers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/providers` | — | Search/list approved providers; optional `latitude`, `longitude`, and `radiusKm` enable nearby results |
| GET | `/api/providers/:id` | — | Get provider profile |
| GET | `/api/providers/me` | Provider | My provider profile |
| PATCH | `/api/providers/me` | Provider | Update profile |
| PATCH | `/api/providers/me/availability` | Provider | Set availability |
| POST | `/api/providers/me/documents` | Provider | Upload verification document |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/bookings` | Customer | Create booking |
| GET | `/api/bookings` | Customer | My bookings |
| GET | `/api/bookings/provider` | Provider | Provider's jobs |
| GET | `/api/bookings/:id` | ✅ | Booking details |
| PATCH | `/api/bookings/:id/status` | ✅ | Update status (role-validated transitions) |
| PATCH | `/api/bookings/:id/cancel` | Customer | Cancel booking |

### Disputes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/disputes` | ✅ | Raise dispute (booking owner only) |
| GET | `/api/disputes/me` | ✅ | My disputes |
| GET | `/api/disputes/:id` | ✅ | Single dispute |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/documents/:filename` | Provider/Admin | Download verification document (protected) |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/analytics` | Admin | KPIs & charts |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users/:id` | Admin | Update user (no admin escalation) |
| GET | `/api/admin/providers` | Admin | All providers |
| PATCH | `/api/admin/providers/:id/verify` | Admin | Approve/reject provider |
| GET | `/api/admin/bookings` | Admin | All bookings |
| GET | `/api/admin/disputes` | Admin | All disputes |
| PATCH | `/api/admin/disputes/:id` | Admin | Resolve dispute |
| GET/POST/PATCH | `/api/admin/categories` | Admin | Category management |

---

## 🔒 Security

- JWT tokens with configurable expiry
- bcrypt password hashing (salt rounds: 12)
- Role-based middleware on all protected routes
- **Registration blocks admin role** — only customer/provider allowed via API
- **Server-side price calculation** — client-submitted prices ignored
- **Dispute authorization** — users can only dispute their own bookings
- **Document protection** — verification files require JWT auth (no public /uploads)
- **Booking transition validation** — invalid status changes rejected server-side
- **Scheduled booking validation** — past/invalid dates rejected server-side
- express-validator server-side input validation
- CORS configured for specific client origin
- No secrets hardcoded — all in `.env`
- `.env` excluded from git via `.gitignore`

---

## 📊 Booking Status Lifecycle

```
Pending
  ├── → Assigned (provider accepts)
  ├── → Rejected (provider rejects)
  └── → Cancelled (customer/admin)

Assigned
  ├── → In Progress (provider starts job)
  └── → Cancelled (customer/admin)

In Progress
  └── → Completed (provider marks done)
```

Invalid transitions are rejected server-side with a meaningful 400 error.

---

## ☁️ Deployment

### Frontend → Netlify
```bash
cd client
npm run build
# Deploy client/dist/ to Netlify
```

Set environment variable in Netlify:
```
VITE_API_URL=https://mall-home-utility-api.onrender.com/api
```

### Backend → Render
1. Connect your GitHub repo to Render
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all environment variables from `.env.example`

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Set `MONGO_URI` in Render environment variables

---

## 🎨 Design System

**Color Palette** (Soft Modern Utility):
| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| Soft Aqua | Primary visual | `#ABDDDE` | CTAs, highlights |
| Mint Green | Secondary sections | `#CAF1DE` | Trust, success |
| Pale Green | Soft backgrounds | `#E1F8DC` | Section alternates |
| Cream Yellow | Accents | `#FEF9DC` | Small highlights |
| Soft Peach | Support | `#FFE7C8` | Service tiles |
| Warm Peach | Decorative | `#F7D8BB` | Borders, dividers |

**Typography:** Manrope (display) + Inter (body)

---

## 📄 License

MIT © 2026 Mall & Home Utility Services Aggregator

---