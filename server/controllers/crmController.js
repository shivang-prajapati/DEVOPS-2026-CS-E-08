const { dbAsync } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const healthCheck = (req, res) => {
  const payload = {
    status: 'UP',
    environment: process.env.NODE_ENV || 'development',
    database: 'sqlite',
    timestamp: new Date().toISOString()
  };

  return sendSuccess(res, 200, payload, 'EstateX service is healthy');
};

const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return sendError(res, 400, 'Name, email, and message are required.');
    }

    const result = await dbAsync.addContact(name, email, subject || '', message);
    return sendSuccess(res, 201, result, 'Contact inquiry saved successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await dbAsync.getContacts();
    return sendSuccess(res, 200, contacts, 'Contacts retrieved successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, property_id, message } = req.body;

    if (!name || !email || !message) {
      return sendError(res, 400, 'Name, email, and message are required.');
    }

    const result = await dbAsync.addEnquiry(name, email, phone || '', property_id || '', message);
    return sendSuccess(res, 201, result, 'Property enquiry submitted successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getEnquiries = async (req, res) => {
  try {
    const enquiries = await dbAsync.getEnquiries();
    return sendSuccess(res, 200, enquiries, 'Enquiries retrieved successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await dbAsync.getProperties();
    return sendSuccess(res, 200, properties, 'Properties retrieved successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

const createProperty = async (req, res) => {
  try {
    const { title, price, type, location, image } = req.body;

    if (!title || !price || !type || !location) {
      return sendError(res, 400, 'Title, price, type, and location are required.');
    }

    const result = await dbAsync.addProperty(title, price, type, location, image || './assets/images/property-1.jpg');
    return sendSuccess(res, 201, result, 'New property entry added successfully.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = {
  healthCheck,
  createContact,
  getContacts,
  createEnquiry,
  getEnquiries,
  getProperties,
  createProperty
};
