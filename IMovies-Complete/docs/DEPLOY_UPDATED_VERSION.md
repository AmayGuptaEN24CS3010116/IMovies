# Deploy the Expanded IMovies Version

The repository on GitHub currently contains the first MVP. This folder contains a newer source version. The hosted Render/Vercel services will not use these changes until the updated files are committed to the same GitHub repository.

## Files/folders changed or added

- `server/index.js`, `server/package.json`, `server/bootstrapData.js`, `server/seed.js`
- `server/models/Booking.js`, `server/routes/auth.js`, `server/routes/bookings.js`, `server/routes/movies.js`, `server/middleware/auth.js`
- New models: `Theatre.js`, `Show.js`, `Payment.js`, `Notification.js`, `SeatReservation.js`
- New routes: `admin.js`, `theatres.js`, `shows.js`, `notifications.js`, `payments.js`
- New `server/lib/`, `server/tests/`
- `client/src/App.jsx`, `client/src/AdminPanel.jsx`, `client/src/styles.css`, `client/package.json`, `client/vite.config.js`
- README and docs

## Browser-only upload procedure (GitHub Codespaces)

If you do not want to install Git or VS Code on your PC, use Codespaces in the browser:

1. Open the repository on GitHub and click the green **Code** button.
2. Open the **Codespaces** tab and choose **Create codespace on main** (if Codespaces is available for your account).
3. In the Codespaces VS Code window, use the Explorer to upload `IMovies-Complete-Project.zip` into the workspace. The ZIP you downloaded should contain a top-level `IMovies-Complete/` folder.
4. Open **Terminal → New Terminal** and run:

   ```bash
   unzip -o IMovies-Complete-Project.zip -d /tmp/imovies-update
   cp -a /tmp/imovies-update/IMovies-Complete/. .
   rm -f IMovies-Complete-Project.zip
   git status
   ```

   If your uploaded ZIP has a different filename, substitute that filename in the `unzip` command. Check `git status` and make sure the modified/new files are inside `client/`, `server/`, `docs/`, and `assets/`, not nested under another project folder.
5. Commit and push the replacement source:

   ```bash
   git add .
   git commit -m "Expand IMovies with cinema management and live seats"
   git push origin main
   ```

6. Wait for Render and Vercel to deploy the new commit. Existing environment variables remain saved in those services. Check the Render logs and Vercel build status before testing the new version.

Do not upload the ZIP to the repository as a file and expect Render/Vercel to deploy its contents; the source files themselves must be copied into the repo and committed. Never copy `.env` files or `node_modules`.

## Recommended upload procedure

Use GitHub Desktop if available, because it preserves folder structure and replaces same-path files clearly:

1. Clone `https://github.com/AmayGuptaEN24CS3010116/IMovies` to your computer.
2. Make a backup copy of the local clone first.
3. Extract the updated `IMovies-Complete` package.
4. Copy its **contents** into the cloned repository root, choosing **Replace files** when Windows asks. Do not copy `.env` files or `node_modules`.
5. In GitHub Desktop, review the changed/new files; commit with message `Expand IMovies with admin, shows, notifications and live seat updates`; push to origin.
6. GitHub will trigger a new Render deploy (server root `server`) and Vercel deploy (frontend root `client`). Wait for both to report healthy/ready.

If you are using only GitHub's browser uploader, it can be awkward to replace many existing files at the same paths. Do not upload the package ZIP as a replacement for source code. If the online UI cannot overwrite existing files, use GitHub Desktop or a browser-based Git environment; do not delete the old project before the new code is committed.

## Required hosted values

- Render service root directory: `server`
- Render build command: `npm install`
- Render start command: `npm start`
- Render environment: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`
- `CLIENT_URL` should be `https://i-movies-amber.vercel.app` (without a trailing slash)
- Vercel root directory: `client`
- Vercel build command: `npm run build`
- Vercel output directory: `dist`
- Vercel env var: `VITE_API_URL=https://imovies-api.onrender.com/api`

On startup the new backend creates sample theatres and a week's worth of demo shows only if those collections are empty. Existing movie records are preserved. Check the Render logs after deployment; then verify `/api/health`, `/api/theatres`, and `/api/shows?limit=10`.
