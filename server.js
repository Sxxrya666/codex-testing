const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
app.use(express.json());

// Basic security headers (no external dependencies)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/confessions';
const WEBHOOK_URL = process.env.WEBHOOK_URL;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const confessionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  comments: [{ message: String, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
});

const Confession = mongoose.model('Confession', confessionSchema);

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});

app.post('/confessions', postLimiter, async (req, res) => {
  try {
    const confession = new Confession({ content: req.body.content });
    await confession.save();
    if (WEBHOOK_URL) {
      try {
        await axios.post(WEBHOOK_URL, confession.toJSON());
      } catch (err) {
        console.error('Webhook failed', err.message);
      }
    }
    res.status(201).json(confession);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/confessions', async (req, res) => {
  const confessions = await Confession.find().sort({ createdAt: -1 });
  res.json(confessions);
});

app.get('/confessions/:id', async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ error: 'Not found' });
    res.json(confession);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.post('/confessions/:id/upvote', async (req, res) => {
  try {
    const confession = await Confession.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!confession) return res.status(404).json({ error: 'Not found' });
    res.json(confession);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.post('/confessions/:id/comments', async (req, res) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) return res.status(404).json({ error: 'Not found' });
    confession.comments.push({ message: req.body.message });
    await confession.save();
    res.json(confession);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
