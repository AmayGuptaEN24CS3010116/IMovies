# 🎬 IMovies — Movie Ticket Booking Made Simple

IMovies is a MERN-stack cinema booking and management **student demo**. It supports movie discovery, theatre/show scheduling, user authentication, seat reservations, simulated checkout, booking history/cancellation, notifications, and a role-protected administration panel.

> **Payment disclaimer:** checkout is simulated for project demonstrations. It does not connect to a payment provider and never charges real money. Do not present this build as a production-ready ticketing/payment service.

## Feature map

### Customer experience
- Movie catalogue, text search, genre, language, and city filtering
- Movie shows populated from MongoDB by date, theatre, screen, language, and price
- User registration/login, bcrypt password hashing, JWT-protected APIs
- Real seat availability backed by MongoDB seat reservations
- Seat changes broadcast through Socket.IO to users viewing the same show
- Simulated checkout creates a payment record marked `simulated_success`; no money moves
- My Tickets history, booking code, cancellation, simulated refund status
- Persistent booking/cancellation notifications

### Cinema administration
- Admin-only overview dashboard and counts
- CRUD for movie records
- CRUD/deactivation for theatres
- Schedule/edit/cancel shows with screen layout and prices
- Admin view of bookings

### Backend safeguards
- Protected user/admin routes and server-side validation
- Unique `{ show, seat }` index to prevent the same seat being reserved twice for a show
- API, authentication, and booking rate limits
- Pagination on movies, shows, bookings, notifications, and admin lists
- MongoDB indexes for common search/booking queries
- Centralized error handling
- Automated unit tests for seat-layout and pagination helpers

## Stack
- **Frontend:** React, Vite, JavaScript, CSS, Lucide React, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB, Mongoose
- **Authentication:** bcryptjs and JSON Web Tokens
- **Protection:** express-rate-limit

## Folder structure

```text
IMovies/
├── client/
│   ├── src/App.jsx
│   ├── src/AdminPanel.jsx
│   ├── src/main.jsx
│   ├── src/styles.css
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
├── server/
│   ├── models/        # User, Movie, Theatre, Show, Booking, Payment, Notification, SeatReservation
│   ├── routes/        # auth, movies, theatres, shows, bookings, payments, notifications, admin
│   ├── middleware/    # JWT and admin access
│   ├── lib/           # seat and pagination helpers
│   ├── tests/         # Node.js native unit tests
│   ├── data/movies.json
│   ├── bootstrapData.js
│   ├── index.js
│   ├── seed.js
│   ├── .env.example
│   └── package.json
├── assets/            # architecture diagrams and illustrative previews
├── docs/              # report, demo script, test plan and setup instructions
├── .gitignore
├── LICENSE
└── README.md
```

## Requirements
- Node.js 18+ and npm
- MongoDB Community Server or MongoDB Atlas
- A modern browser

## Local setup

### 1. Backend
```bash
cd server
```
Copy `.env.example` to `.env` (Windows PowerShell: `Copy-Item .env.example .env`; macOS/Linux/Git Bash: `cp .env.example .env`). Set a working `MONGO_URI` and a long, private `JWT_SECRET`.

```bash
npm install
npm run seed
npm run dev
```
The API is normally at `http://localhost:8000`. Visit `http://localhost:8000/api/health` for a health check. Startup/seed only adds demo records if the relevant collections are empty; it does not intentionally replace existing movie data.

### 2. Frontend
Open a second terminal:
```bash
cd client
```
Copy `.env.example` to `.env`; keep `VITE_API_URL=http://localhost:8000/api` for local development.

```bash
npm install
npm run dev
```
Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

### 3. Unit tests
```bash
cd server
npm test
```
Tests use Node's built-in test runner. API/browser regression scenarios are listed in `docs/TEST_PLAN.md` and must also be exercised on the deployed app.

## Hosted setup (Render + Vercel + Atlas)

### Render backend
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Set `MONGO_URI` to the private Atlas URI with database name `imovies`
- Set `JWT_SECRET` to a strong, unique secret
- Set `CLIENT_URL` to the exact Vercel production origin (no trailing slash)
- On successful startup, `bootstrapData.js` adds missing sample theatres and shows if those collections are empty

### Vercel frontend
- Root Directory: `client`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment variable `VITE_API_URL` must be `https://<your-render-service>.onrender.com/api`
- Redeploy after changing frontend environment variables

Never commit `.env` files or paste database secrets into GitHub, chat, screenshots, or a report. For Atlas access, prefer a restrictive network access list and a least-privilege database user; broad `0.0.0.0/0` access was used for initial student troubleshooting and should be restricted after deployment tests.

## Enabling the admin dashboard for a student demo

New accounts are users by default; public registration cannot grant admin permissions.

1. Register your own account through the deployed app.
2. In MongoDB Atlas Data Explorer, open database `imovies`, collection `users`, find your account by email, and edit the `role` field from `user` to `admin` (string).
3. Save the document, log out of IMovies, then log in again. The API returns the persisted role; an **Admin** button should appear.
4. Never promote untrusted accounts. In a production system, role changes should be performed through a privileged internal process with audit logging.

## API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Service health |
| GET | `/api/movies` | Public | List, search, genre/language/city filter, paginate |
| GET | `/api/movies/:id` | Public | Movie details |
| GET | `/api/theatres` | Public | List active theatres, filter by city/name |
| GET | `/api/shows` | Public | Filter scheduled shows by movie, date, theatre, city |
| GET | `/api/shows/:id/seats` | Public | Seat map and occupied seats |
| POST | `/api/auth/register` | Public, rate-limited | Register |
| POST | `/api/auth/login` | Public, rate-limited | Log in |
| GET | `/api/auth/me` | JWT | Current profile |
| POST | `/api/bookings` | JWT, rate-limited | Reserve seats and create demo-payment record |
| GET | `/api/bookings/my` | JWT | Current user's bookings, paginated |
| PATCH | `/api/bookings/:id/cancel` | Owner/admin | Cancel, release reservations and record simulated refund status |
| GET | `/api/notifications/my` | JWT | Notifications and unread count |
| PATCH | `/api/notifications/:id/read` | JWT | Mark one notification read |
| PATCH | `/api/notifications/read-all` | JWT | Mark all read |
| GET | `/api/payments/my` | JWT | Current user's payment records |
| GET | `/api/admin/stats` | Admin | Dashboard counts / demo total |
| CRUD | `/api/admin/movies` | Admin | Create/read/update/delete movies |
| CRUD | `/api/admin/theatres` | Admin | Create/read/update/deactivate theatres |
| CRUD | `/api/admin/shows` | Admin | Schedule/edit/cancel shows |
| GET | `/api/admin/bookings` | Admin | Booking oversight |

Protected routes require `Authorization: Bearer <JWT>`.

## Data model overview

- **User:** name, unique email, password hash, role
- **Movie:** title, description, genres, duration, language, poster, price
- **Theatre:** name, city, address, screens, facilities, active flag
- **Show:** movie + theatre refs, date/time, screen, language, price and seat layout
- **Booking:** user, movie/show/theatre refs, date/time, seats, amount, status, payment status and unique booking code
- **SeatReservation:** one row per held seat; unique index `{ show, seat }` blocks duplicate seat reservations for a scheduled show
- **Payment:** demo payment reference/status; no real gateway
- **Notification:** user-targeted booking/cancellation messages with read state

## Testing checklist
1. Register and log in as a user.
2. Browse and search movies; filter genre, language and city.
3. Choose a future date and select an actual scheduled theatre/show.
4. Select seats and confirm the demo booking.
5. Check My Tickets and the notifications list.
6. Open the same show in a second session; verify seats update after booking/cancellation.
7. Cancel a booking and verify seats become available again.
8. Promote a test account to admin through Atlas and test admin movie/theatre/show CRUD.
9. Confirm unauthenticated requests cannot access protected endpoints, and non-admins receive 403 from admin routes.
10. Run `npm test` and complete the API/browser checklist in `docs/TEST_PLAN.md`.

## Current boundaries
- Payments are simulation-only and must not be described as live payment gateway integration.
- This student project is not a production service. Before real-world use, add a payment provider with verified webhooks, email/QR ticket delivery, audit logging, improved deployment secret rotation, transaction/lock expiry strategy, monitoring, and broader integration/UI test coverage.
- Movie poster URLs are external and can expire or be blocked by an image host.
