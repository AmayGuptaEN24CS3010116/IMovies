# IMovies Test Plan

Run these checks on the deployed website after the upgraded commit has completed deployment. Record **Pass**, **Fail**, or **Not run** honestly; do not mark unrun tests as passed.

## Automated tests

From `server/` run:

```bash
npm test
```

The Node.js native test runner currently tests seat-code validation, seat-layout generation and pagination bounds/metadata. This is a unit test set, not a full end-to-end suite.

## Manual API and UI regression matrix

| ID | Test | Expected result | Status |
|---|---|---|---|
| T01 | Open `/api/health` on Render | JSON `status: ok` and `realtime: true` |PASS — API returned status ok. |
| T02 | Open `/api/movies?limit=10` | Movie records and pagination object | PASS — Movie records and pagination returned successfully. |
| T03 | Register with valid name/email/password | 201, JWT and user profile; password is not returned | PASS — New user registered successfully. |
| T04 | Register same email again | 409 conflict message | PASS — Duplicate email registration rejected. |
| T05 | Log in with wrong password | 401 and generic credential error | PASS — Incorrect password rejected; login denied. |
| T06 | Search/filter movies by genre, language, title and city | Catalogue filters the expected records | PASS — Movie search and genre filtering work correctly. |
| T07 | Open movie, choose date/cinema/showtime | Shows are loaded from MongoDB | PASS — Movie details and available showtimes displayed correctly. |
| T08 | Select available seats and confirm booking | Booking + demo payment record + notification are created | PASS — Seat selection works and the total price updates correctly. |
| T09 | Attempt to reserve same show/seat from a second account/session | Duplicate reservation is rejected with 409 | PASS — Duplicate reservation rejected with 409 Conflict. |
| T10 | Open second session with same show selected | Socket.IO pushes seat refresh after booking/cancellation | PASS — Seat availability refreshed in the second session. |
| T11 | Open My Tickets | Signed-in user's bookings show date, seats, code, total and status | PASS — Booking details display correctly and persist after refresh. |
| T12 | Cancel a confirmed booking | Status changes to cancelled and show seats are released | PASS — Booking cancellation works and the seats are released. |
| T13 | Open notification panel and mark as read | Notifications persist and unread count updates |PASS — Notifications persist and the unread count updates correctly.|
| T14 | Inspect payment detail | Payment is labelled simulated; no live charge occurs | PASS — Payment is labelled as simulated; no real charge occurs. |
| T15 | User calls an admin API | 403 Forbidden |PASS — Normal user is denied access to admin-only operations. |
| T16 | Admin creates/edits a movie | Changes persist in MongoDB and catalogue reloads | PASS — Admin movie changes persist in MongoDB and appear in the catalogue. |
| T17 | Admin creates/edits/deactivates a theatre | Changes persist and inactive theatre is hidden from public choices | PASS — Theatre creation, editing and deactivation work correctly. |
| T18 | Admin schedules/edits/cancels a show | Show is saved; cancelled shows are not bookable | PASS — Shows can be created, edited and cancelled; cancelled shows cannot be booked. |
| T19 | API abuse / rate-limit smoke test | Repeated requests eventually receive 429 | Not run after latest code update |
| T20 | Narrow desktop and mobile viewport | Layout remains navigable, no major clipping | PASS — Desktop and mobile layouts remain usable without major clipping. |

## Evidence to capture

Store genuine screenshots in `assets/screenshots/`:

1. Homepage with live data loaded.
2. Search + genre/language/city filtering.
3. Show selection showing a theatre, screen, date, time and price.
4. Seat map with selected seats and occupied seats.
5. Confirmed demo booking / My Tickets.
6. Cancellation reflected in My Tickets and reopened seat availability.
7. Notifications list.
8. Admin dashboard after the student account has been promoted to `admin` in Atlas.
9. Admin movie/theatre/show management screens.
10. Render health endpoint and the browser's live deployment URL (avoid exposing secret settings).

Only include screenshots actually captured from the deployed site. The images in `assets/previews/` are illustrative design previews, not runtime evidence.

## Important release note

This project uses simulated payments; payment state and a demo payment record are persisted, but no external payment gateway is connected. Passing these tests validates the college demonstration workflow, not production readiness.
