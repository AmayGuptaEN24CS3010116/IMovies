# Upload IMovies to GitHub

## Option A - Upload in a browser (no Git commands required)
1. Sign in at https://github.com/new and create a repository named `IMovies`.
2. Choose Public only if your course permits public visibility. Keep the repository empty: do not generate a README, licence or `.gitignore` because these are already included.
3. Extract the downloaded `IMovies-Submission-Pack.zip` on your computer.
4. Open the extracted `IMovies-Submission` folder. Upload the *contents inside that folder* so `client/`, `server/`, `docs/`, `assets/`, `README.md`, `.gitignore` and `LICENSE` appear at the repository root.
5. On GitHub, choose **Add file -> Upload files** (or the “uploading an existing file” link in an empty repository). Drag the folders and files into the page. Do not drag the ZIP file itself unless you intend to store only an archive.
6. Commit with message `Initial commit - IMovies MERN project` to the `main` branch.
7. Open the repository page and copy its actual URL. Put that URL in `docs/SKILLWALLET_SUBMISSION.md` and your SkillWallet submission.

## Option B - Use Git from VS Code
1. Extract the ZIP and open the extracted `IMovies-Submission` folder in VS Code.
2. Create an empty repository at https://github.com/new; do not add a README or other starter files.
3. Open the VS Code terminal from the project root and run:

```bash
git init
git add .
git commit -m "Initial commit - IMovies MERN project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/IMovies.git
git push -u origin main
```

4. Replace `YOUR_USERNAME` with your GitHub username before running the `git remote` command. GitHub may ask you to authenticate through a browser/credential manager.

## Before committing
- The `.gitignore` excludes `.env`, `node_modules`, logs and build output.
- Commit only `.env.example` files, never `server/.env` or `client/.env`.
- If Git asks for author identity, set `git config --global user.name "Your Name"` and `git config --global user.email "your-github-email@example.com"` with your own details.

## Finish the submission
Repository upload is not the whole submission. Run the application, fill in the test results, replace UI previews with actual screenshots, record the demo video, and submit the real repo/demo URLs via SkillWallet.
