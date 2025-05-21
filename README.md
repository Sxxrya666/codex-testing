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

2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `PORT`, and optional `WEBHOOK_URL`. 

3. Start the server:
```bash
npm start
```

The API will run on `http://localhost:3000` by default.
