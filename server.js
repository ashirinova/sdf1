const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Marşrutları
app.use('/api/events', require('./src/routes/events'));
app.use('/api/registrations', require('./src/routes/registrations'));
app.use('/api/stats', require('./src/routes/stats'));

// Centralized Error Handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} unvaninda isleyir.`);
  });
}

module.exports = app;