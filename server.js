require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(generalLimiter);

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

app.post(
  '/confessions',
  postLimiter,
  body('content').isLength({ min: 1 }).trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
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

app.post(
  '/confessions/:id/comments',
  body('message').isLength({ min: 1 }).trim(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const confession = await Confession.findById(req.params.id);
      if (!confession) return res.status(404).json({ error: 'Not found' });
      confession.comments.push({ message: req.body.message });
      await confession.save();
      res.json(confession);
    } catch (err) {
      res.status(400).json({ error: 'Invalid ID' });
    }
  }
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
