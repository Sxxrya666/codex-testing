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

2. Provide a MongoDB connection string in the `MONGODB_URI` environment variable. Optional: set `WEBHOOK_URL` to notify an external service of new confessions. Use `ALLOWED_ORIGIN` to specify a CORS origin.

3. Start the server:
   ```bash
   npm start
   ```

The API will run on `http://localhost:3000` by default.

## Security

This API applies several protections including:

- HTTP security headers via Helmet
- Input sanitization against NoSQL injection and XSS
- Global and per-route rate limiting
- CORS origin restriction with `ALLOWED_ORIGIN`
