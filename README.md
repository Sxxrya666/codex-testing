# Anonymous Confession API

This project provides a simple Express API backed by MongoDB where users can post anonymous confessions and others can upvote or comment anonymously.

## Features

- Post, read, and upvote confessions
- Add anonymous comments
- Rate limiting on posting to prevent spam
- Optional webhook notifications when a new confession is created

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Provide a MongoDB connection string in the `MONGODB_URI` environment variable. Optional: set `WEBHOOK_URL` to notify an external service of new confessions.

3. Start the server:
   ```bash
   npm start
   ```

The API will run on `http://localhost:3000` by default.

## Security Features TODO

- [x] Set strict security headers
- [ ] Input validation and sanitization
- [ ] Implement custom rate limiting without third party packages
- [ ] Enforce HTTPS and HSTS
- [ ] Add authentication with hashed passwords
- [ ] Issue HMAC-based session tokens
- [ ] Role-based authorization for admin actions
- [ ] CSRF protection for state-changing requests
- [ ] Logging and audit trail
- [ ] Regular security testing scripts

