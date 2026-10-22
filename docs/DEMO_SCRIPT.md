# IMovies Demo Video Script (3-5 minutes)

Record this only after deploying the updated repository and completing the manual test plan. Use the actual live website and do not show passwords, JWT values, MongoDB URI, secret environment values or personal user data.

## 0:00-0:25 — Introduction

“Hello, this is IMovies - Movie Ticket Booking Made Simple. It is a MERN-stack student project built using React, Express, Node.js and MongoDB. The demo shows movie discovery, theatre schedules, live seat selection, bookings, notifications and cinema administration.”

## 0:25-1:05 — Movie discovery

- Show homepage and movie cards.
- Search by a title.
- Switch genre and language filters.
- Use the city filter if more than one demo city is configured.

## 1:05-1:45 — Scheduled shows and seats

- Open a movie.
- Choose a date and a scheduled show card with theatre and screen details.
- Show seat availability and select two seats.
- State clearly that checkout is simulated and no real money is charged.

## 1:45-2:25 — Booking and customer account

- Confirm a demo booking.
- Open My Tickets and point out the booking code, date/time, seats, total and status.
- Open Notifications to show the persisted booking notification.

## 2:25-2:55 — Cancellation and seat release

- Cancel a test booking.
- Show the cancelled status in My Tickets.
- Re-open the same show and show that released seats become available again.

## 2:55-3:55 — Admin (optional if configured)

- Log in with the account promoted to admin in Atlas.
- Open Admin.
- Show the overview totals, add/edit a sample movie, a theatre, and a scheduled show. Use safe demo information.
- Show the bookings table.

## 3:55-4:25 — Architecture and wrap-up

Briefly mention the MongoDB document models, JWT-protected routes, admin authorization, rate limiting, pagination, unique show-seat reservations and Socket.IO seat updates.

## Recording and hosting

Use Windows Snipping Tool screen recording, Xbox Game Bar (`Win + Alt + R`, if available) or another trusted recorder. Review the entire clip before sharing. Upload to Google Drive or YouTube and test access in a private/incognito window. Do not claim a live payment integration or features you have not demonstrated.
