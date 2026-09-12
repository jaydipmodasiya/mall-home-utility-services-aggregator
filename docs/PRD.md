# Product Requirements Document (PRD)
## Mall & Home Utility Services Aggregator

**Version:** 1.0  
**Date:** September 2026  
**Project Type:** UnifiedMentor Full-Stack Project  

---

## 1. Project Overview

### 1.1 Product Vision
**Mall & Home Utility Services Aggregator** is a centralized digital platform that connects users with nearby verified service providers such as electricians, plumbers, carpenters, tailors, and maintenance staff. The platform enables quick discovery, booking, and management of small on-demand utility tasks for homes, apartments, and commercial spaces like malls.

### 1.2 Problem Statement
Users and facility managers face difficulties finding reliable service providers because of:
- Lack of verified local professionals
- Time-consuming manual coordination
- Unclear pricing and availability
- Dependence on word-of-mouth or local contacts

### 1.3 Solution
A digital aggregator platform where:
- Customers can discover, evaluate, and book verified local professionals
- Service providers can receive, manage, and complete job requests
- Admins can verify providers and monitor the platform

---

## 2. Stakeholders

| Stakeholder | Role |
|-------------|------|
| End Customer | Books services, submits reviews |
| Service Provider | Registers, receives and fulfills job requests |
| Platform Admin | Verifies providers, resolves disputes, monitors platform |
| UnifiedMentor | Project evaluation and submission |

---

## 3. User Roles & Permissions

### 3.1 Customer
- Register and authenticate
- Browse all service categories
- Search providers with filters (city, category, availability, rating)
- View provider profiles with full details
- Book instantly or schedule for later
- Track booking status with timeline
- Cancel pending/assigned bookings
- Submit reviews and ratings after completion
- Raise disputes on completed bookings
- View full service history

### 3.2 Service Provider
- Register with provider role
- Build complete profile (bio, skills, experience, pricing)
- Upload verification documents (identity + skill certificates)
- Set weekly availability schedule
- View and manage incoming job requests
- Accept or reject pending requests
- Update job status: Assigned → In Progress → Completed
- View earnings dashboard (total and monthly)
- View job history

### 3.3 Admin
- Secure admin-only dashboard
- View 8 platform KPIs in real-time
- Manage all users (view, activate, deactivate, delete)
- Review provider verification applications with documents
- Approve or reject provider verification with notes
- Monitor all bookings with category and status filters
- Manage disputes with manual resolution and notes
- Manage service categories and pricing guidelines
- View analytics with charts (monthly bookings, category distribution)

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
- FR-01: Users can register with name, email, password, phone, and role (customer/provider)
- FR-02: Passwords must be at least 6 characters, hashed with bcrypt (salt 12)
- FR-03: JWT tokens issued on login/register with configurable expiry
- FR-04: Protected routes enforce role-based access
- FR-05: Token auto-clears on 401 response

### 4.2 Provider Discovery
- FR-06: Public provider search with filters: category, city, area, availability, minimum rating
- FR-07: Providers sorted by rating DESC, completed jobs DESC
- FR-08: Paginated results (12 per page)
- FR-09: Only approved providers appear in public search

### 4.3 Booking Flow
- FR-10: Customer selects service category from provider's offerings
- FR-11: Customer chooses instant or scheduled booking
- FR-12: Customer provides service description (max 1000 chars) and location
- FR-13: Booking created with status=pending
- FR-14: Provider receives request and can accept or reject
- FR-15: On accept: status → assigned
- FR-16: Provider can start: status → in_progress
- FR-17: Provider marks complete: status → completed; earnings updated
- FR-18: Customer can cancel pending or assigned bookings (server-validated)
- FR-19: Full status history with timestamps maintained

### 4.4 Reviews & Disputes
- FR-20: Customer can submit one review per completed booking
- FR-21: Review includes rating (1-5) and optional comment
- FR-22: Provider average rating auto-calculated on every review
- FR-23: Customer or provider can raise a dispute on their own booking (ownership verified server-side; not allowed on pending bookings)
- FR-24: Admin manually resolves disputes with written resolution

### 4.5 Admin Operations
- FR-25: Admin can activate/deactivate users
- FR-26: Admin can approve/reject provider verification with notes
- FR-27: Admin can update dispute status and add resolution
- FR-28: Admin can create/update service categories and pricing

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | Search and booking target < 3 seconds response |
| Security | JWT auth, bcrypt hashing, role-based guards, server-side validation |
| Scalability | Paginated APIs, indexed DB queries, city-based filtering |
| Responsiveness | Desktop, tablet, and mobile fully supported |
| Usability | Minimal steps to complete a booking (3 steps) |
| Reliability | Centralized error handling, proper HTTP status codes |

---

## 6. Out of Scope (Phase 1)

- Native mobile applications (iOS/Android)
- Online payments or invoicing
- In-app real-time chat
- Material procurement / inventory management
- Long-term AMC contracts
- AI-based service recommendations
- Automated dispute resolution

---

## 7. Booking Status Flow

```
[pending] → accept → [assigned] → start → [in_progress] → complete → [completed]
         ↘ reject → [rejected]
[pending/assigned] → cancel → [cancelled]
```

---

## 8. KPIs

| KPI | Description |
|-----|-------------|
| Total Registered Customers | Count of users with role=customer |
| Verified Providers | Providers with verificationStatus=approved |
| Total Bookings | All bookings in the system |
| Completion Rate | completedBookings / totalBookings × 100 |
| Average Satisfaction Rating | Mean of all review ratings |
| Average Completion Time | Mean duration from booking creation to completion |
| Open Disputes | Disputes with status=open |
| New Users (30 days) | Users registered in the last 30 days |

---

## 9. Future Enhancements (Phase 2+)

- Online payments and invoice generation
- Real-time chat between customer and provider
- Mobile application (React Native)
- AMC/subscription plans
- AI-based provider recommendations
- Automated notifications (SMS/email)
- Provider performance badges
