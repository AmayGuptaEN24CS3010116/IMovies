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
| T01 | Open `/api/health` on Render | JSON `status: ok` and `realtime: true` | Not run after latest code update |
| T02 | Open `/api/movies?limit=10` | Movie records and pagination object | Not run after latest code update |
| T03 | Register with valid name/email/password | 201, JWT and user profile; password is not returned | Not run after latest code update |
| T04 | Register same email again | 409 conflict message | Not run after latest code update |
| T05 | Log in with wrong password | 401 and generic credential error | Not run after latest code update |
| T06 | Search/filter movies by genre, language, title and city | Catalogue filters the expected records | Not run after latest code update |
| T07 | Open movie, choose date/cinema/showtime | Shows are loaded from MongoDB | Not run after latest code update |
| T08 | Select available seats and confirm booking | Booking + demo payment record + notification are created | Not run after latest code update |
| T09 | Attempt to reserve same show/seat from a second account/session | Duplicate reservation is rejected with 409 | Not run after latest code update |
| T10 | Open second session with same show selected | Socket.IO pushes seat refresh after booking/cancellation | Not run after latest code update |
| T11 | Open My Tickets | Signed-in user's bookings show date, seats, code, total and status | Not run after latest code update |
| T12 | Cancel a confirmed booking | Status changes to cancelled and show seats are released | Not run after latest code update |
| T13 | Open notification panel and mark as read | Notifications persist and unread count updates | Not run after latest code update |
| T14 | Inspect payment detail | Payment is labelled simulated; no live charge occurs | Not run after latest code update |
| T15 | User calls an admin API | 403 Forbidden | Not run after latest code update |
| T16 | Admin creates/edits a movie | Changes persist in MongoDB and catalogue reloads | Not run after latest code update |
| T17 | Admin creates/edits/deactivates a theatre | Changes persist and inactive theatre is hidden from public choices | Not run after latest code update |
| T18 | Admin schedules/edits/cancels a show | Show is saved; cancelled shows are not bookable | Not run after latest code update |
| T19 | API abuse / rate-limit smoke test | Repeated requests eventually receive 429 | Not run after latest code update |
| T20 | Narrow desktop and mobile viewport | Layout remains navigable, no major clipping | Not run after latest code update |

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
