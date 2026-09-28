const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');
const { sendError } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, '..', 'Real-Estate-X')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'Real-Estate-X', 'index.html'));
});

app.use((req, res) => {
  return sendError(res, 404, 'Route not found');
});

app.use((err, req, res, next) => {
  console.error(err);
  return sendError(res, 500, 'Internal server error');
});

module.exports = app;
