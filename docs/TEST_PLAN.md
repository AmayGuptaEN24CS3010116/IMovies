# IMovies Manual Test Plan

**Purpose:** verify the frontend, REST API and MongoDB integration before recording the demo. These are planned tests; do not mark them passed until you execute them on your own running instance.

## Preconditions
- MongoDB service or Atlas database is reachable.
- `server/.env` contains `MONGO_URI`, `JWT_SECRET`, `PORT=8000`, and `CLIENT_URL=http://localhost:5173`.
- Run `npm install`, `npm run seed`, and `npm run dev` inside `server/`.
- Run `npm install` and `npm run dev` inside `client/` in a second terminal.
- Health endpoint returns `{"status":"ok","app":"IMovies API"}` at `http://localhost:8000/api/health`.

## Test cases

| ID | Scenario | Steps | Expected result | Actual / status |
|---|---|---|---|---|
| T01 | API health | Open `/api/health` | JSON status `ok` | Fill after execution |
| T02 | Movie catalogue | Open the app | Movie cards load from MongoDB if seeded | Fill after execution |
| T03 | Search | Search `Dune` | Matching movie(s) only | Fill after execution |
| T04 | Genre filter | Select a genre | Cards filter by selected genre | Fill after execution |
| T05 | Register | Submit new name/email/password (8+ chars) | Account created; user is signed in | Fill after execution |
| T06 | Duplicate registration | Register same email again | API returns conflict message | Fill after execution |
| T07 | Login | Log in with created account | Session token stored and My Tickets loads | Fill after execution |
| T08 | Invalid login | Use wrong password | Error shown; no session created | Fill after execution |
| T09 | Select seats | Open a movie, choose date/time/seats | Price updates using movie's per-seat price | Fill after execution |
| T10 | Create booking | Log in and confirm available seats | Booking code, seats and total saved | Fill after execution |
| T11 | My Tickets | Open My Tickets after booking | Booking appears with movie/date/time/seats/total | Fill after execution |
| T12 | Previously booked seats | Repeat same movie/date/time/seats using another account | API rejects the already-booked seat(s) | Fill after execution |
| T13 | Unauthenticated booking | Log out and try to confirm booking | Login prompt appears | Fill after execution |
| T14 | Invalid API auth | Call `/api/bookings/my` without JWT | HTTP 401 response | Fill after execution |

## Evidence to capture
Capture real browser screenshots after running the app:
1. Home page with movie cards.
2. Search/filter result.
3. Login or registration form (do not show real passwords or private information).
4. Seat selection modal with date/time and selected seats.
5. Successful booking confirmation or My Tickets list.
6. Terminal/API health check if the course expects backend evidence.

Save them in `assets/screenshots/` and replace the clearly labelled previews in the report. Avoid screenshots containing secrets, environment variables, personal emails, or tokens.
