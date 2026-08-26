const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbAsync } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from Real-Estate-X
app.use(express.static(path.join(__dirname, 'Real-Estate-X')));

// API Routes

// 1. Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'EstateX Backend Server & Database Running' });
});

// 2. Contact form data entries
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    const result = await dbAsync.addContact(name, email, subject || '', message);
    res.status(201).json({ success: true, message: 'Contact inquiry saved successfully.', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/contact', async (req, res) => {
  try {
    const contacts = await dbAsync.getContacts();
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Property enquiry data entries
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, email, phone, property_id, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }
    const result = await dbAsync.addEnquiry(name, email, phone || '', property_id || '', message);
    res.status(201).json({ success: true, message: 'Property enquiry submitted successfully.', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await dbAsync.getEnquiries();
    res.status(200).json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Property entries
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await dbAsync.getProperties();
    res.status(200).json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const { title, price, type, location, image } = req.body;
    if (!title || !price || !type || !location) {
      return res.status(400).json({ success: false, error: 'Title, price, type, and location are required.' });
    }
    const result = await dbAsync.addProperty(title, price, type, location, image || './assets/images/property-1.jpg');
    res.status(201).json({ success: true, message: 'New property entry added successfully.', data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'Real-Estate-X', 'index.html'));
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`EstateX Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
