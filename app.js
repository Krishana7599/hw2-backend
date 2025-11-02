const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Config
const PORT = process.env.PORT || 3000;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hw2';

console.log('[APP] Starting…');
console.log('[APP] Connecting to Mongo:', MONGO);

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Routes
const api = require('./routes/api');
app.get('/', (req, res) => {
  res.json({ ok: true, service: 'HW2 Backend', time: new Date().toISOString() });
});
app.use('/api', api);

// Connect once at startup
mongoose.connect(MONGO).then(() => {
  console.log('[APP] Mongo connected');
  // Only listen when not running tests
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`[APP] Server listening at http://localhost:${PORT}`);
    });
  }
}).catch(err => {
  console.error('[APP] Mongo connection error:', err);
});

// Export app for supertest
module.exports = app;
