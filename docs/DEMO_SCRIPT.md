# IMovies Demo Video Script (about 3-5 minutes)

**Before recording:** run the tests in `TEST_PLAN.md`. Start MongoDB, then the backend (`server/`: `npm run dev`) and frontend (`client/`: `npm run dev`). Use a demo account and non-sensitive sample data. Do not display the `.env` file or any password/token.

## Recording sequence

1. **Introduction (15-20 sec):** “This is IMovies, a MERN-stack movie ticket booking web application. It lets users browse movies, select showtimes and seats, make a demo booking, and review their tickets.”
2. **Home page (30 sec):** show the brand, hero, movie catalogue, genres, ratings, durations and starting prices.
3. **Search/filter (20 sec):** search for a movie title and select a genre filter.
4. **Authentication (30-45 sec):** register a demo account or log in. Explain that passwords are hashed on the server and protected endpoints use JWTs.
5. **Seat booking (60 sec):** open a movie, choose a future date and showtime, select two available seats, show the total and confirm the booking.
6. **My Tickets (30-45 sec):** show the movie, date/time, selected seats, price and booking confirmation code.
7. **Backend proof (20 sec):** optionally open `http://localhost:8000/api/health` and show the API health response.
8. **Conclusion (10-15 sec):** summarize the React frontend, Express REST API and MongoDB collections. Mention payments are not part of this demo MVP.

## Upload and share
- Record the actual application (OBS Studio, Windows Snipping Tool screen recording, or another recorder).
- Upload the video to Google Drive or YouTube.
- Test the share link in a private/incognito window. For Drive, set access to “Anyone with the link can view” only if allowed by your course policy.
- Paste the real URL into `docs/SKILLWALLET_SUBMISSION.md` and submit it through SkillWallet.
