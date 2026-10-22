# 🎬 IMovies — Movie Ticket Booking Made Simple

A MERN-stack movie-ticket-booking college project. Visitors can browse films, search by title or genre, register/log in, choose a showtime and seats, and review their bookings.

> **Status:** Learning/demo MVP. Source and documentation are packaged for review. The project has not yet been end-to-end tested against a live MongoDB instance in this build environment. Complete the local test plan before calling it verified or submitting a real demo recording.

## Features
- Movie catalogue, title search and genre filters
- Account registration and login (bcrypt password hashing and JWT)
- Movie, show-date, showtime and seat selection
- Server-side checking of previously booked seats
- My Tickets page with booking code and total
- Responsive cinema-style UI
- MongoDB/Mongoose models and sample data seeder

## Tech stack
React + Vite · Node.js · Express.js · MongoDB · Mongoose · JWT · bcryptjs

## Project tree
```text
IMovies/
├── client/                   # React + Vite interface
├── server/                   # Express API and MongoDB models
│   └── data/movies.json      # Sample movie dataset
├── docs/                     # Project report, test plan and demo script
├── assets/diagrams/          # Architecture, ER, flow and MVC diagrams
├── assets/previews/          # Clearly marked illustrative UI previews
├── .gitignore
├── LICENSE
└── README.md
```

## Prerequisites
- Node.js 18+ and npm
- MongoDB Community Server locally, or MongoDB Atlas
- Git and a code editor such as VS Code

## Run locally
### 1. Start MongoDB
Start your local MongoDB service, or prepare a MongoDB Atlas database.

### 2. Configure and start the backend
From the project root:
```bash
cd server
```
Create `server/.env` by copying `.env.example`.

**Windows PowerShell:** `Copy-Item .env.example .env`

**macOS/Linux/Git Bash:** `cp .env.example .env`

Set values in `server/.env` (never commit this file):
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/imovies
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
For Atlas, replace `MONGO_URI` with your Atlas connection string.

Install, seed demo movies, and start the API:
```bash
npm install
npm run seed
npm run dev
```
Health check: http://localhost:8000/api/health
Keep the terminal running.

### 3. Configure and start the frontend
Open a second terminal from the project root:
```bash
cd client
```
Create `client/.env` from `.env.example` (PowerShell `Copy-Item .env.example .env`; macOS/Linux/Git Bash `cp .env.example .env`). Then run:
```bash
npm install
npm run dev
```
Open the Vite URL shown in the terminal, usually http://localhost:5173.

## API endpoints
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/health` | API health check | No |
| GET | `/api/movies` | List/search/filter movies | No |
| GET | `/api/movies/:id` | Movie detail | No |
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | JWT |
| POST | `/api/bookings` | Create booking | JWT |
| GET | `/api/bookings/my` | Signed-in user's bookings | JWT |

Protected endpoints expect `Authorization: Bearer <token>`.

## Data model
- `users`: name, email, password hash, role
- `movies`: title, description, genres, runtime, rating, language, certificate, poster URL, price
- `bookings`: user/movie references, show date/time, seats, total, status, booking code

## Documentation and submission resources
- `docs/IMovies-Project-Report.docx` — editable project report
- `docs/IMovies-Project-Report.pdf` — report for submission/reading
- `docs/TEST_PLAN.md` — manual validation checklist
- `docs/DEMO_SCRIPT.md` — recording outline
- `docs/SKILLWALLET_SUBMISSION.md` — final hand-in checklist
- `docs/REFERENCES.md` — technical references
- `docs/GITHUB_UPLOAD_STEPS.md` — browser and Git upload instructions
- `server/data/movies.json` — sample movie dataset

## Known limitations
- Payments are not implemented; bookings are demo confirmations.
- The seat map displays a few fixed sample occupied seats as UI placeholders; the backend checks previously stored bookings during booking confirmation.
- Seat-check and booking creation are not protected by a database transaction/atomic seat reservation, so concurrent booking requests can race. Do not use for real paid ticketing.
- No admin dashboard or movie-management UI is included.
- Poster images are loaded from external URLs and need internet access in the browser.
- Replace preview images in the report with actual screenshots from the locally running application before final submission. Files under `assets/previews/` are explicitly illustrative, not runtime test evidence.

## Security notes
Never commit `.env` files, database credentials, production JWT keys, access tokens, or personal user data. Change `JWT_SECRET` to a long random value for each deployment. Configure exact production CORS origins and deploy only after security testing.
