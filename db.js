require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB || 'estatex';

let client;
let database;
let connectionPromise;

async function connectDb() {
  if (database) return database;
  if (!connectionPromise) {
    client = new MongoClient(mongoUri);
    connectionPromise = client.connect().then(() => {
      database = client.db(databaseName);
      return database;
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }
  return connectionPromise;
}

function serialize(document) {
  const { _id, ...data } = document;
  return { id: _id.toString(), ...data };
}

async function seedProperties(databaseConnection) {
  const properties = databaseConnection.collection('properties');
  if (await properties.countDocuments() === 0) {
    await properties.insertMany([
      { title: 'New Apartment Nice View', price: '$30,000/Month', type: 'Apartment', location: 'Belmont Gardens, Chicago', image: './assets/images/property-1.jpg', created_at: new Date() },
      { title: 'Modern Apartments', price: '$45,000/Month', type: 'Apartment', location: 'Rego Park, New York', image: './assets/images/property-2.jpg', created_at: new Date() },
      { title: 'Luxury villa in Rego Park', price: '$85,000/Month', type: 'Villa', location: 'Rego Park, New York', image: './assets/images/property-3.jpg', created_at: new Date() }
    ]);
  }
}

const dbAsync = {
  addContact: async (name, email, subject, message) => {
    const document = { name, email, subject, message, created_at: new Date() };
    const result = await (await connectDb()).collection('contacts').insertOne(document);
    return serialize({ _id: result.insertedId, ...document });
  },
  getContacts: async () => {
    const documents = await (await connectDb()).collection('contacts').find().sort({ created_at: -1 }).toArray();
    return documents.map(serialize);
  },
  addEnquiry: async (name, email, phone, property_id, message) => {
    const document = { name, email, phone, property_id, message, created_at: new Date() };
    const result = await (await connectDb()).collection('enquiries').insertOne(document);
    return serialize({ _id: result.insertedId, ...document });
  },
  getEnquiries: async () => {
    const documents = await (await connectDb()).collection('enquiries').find().sort({ created_at: -1 }).toArray();
    return documents.map(serialize);
  },
  getProperties: async () => {
    const databaseConnection = await connectDb();
    await seedProperties(databaseConnection);
    const documents = await databaseConnection.collection('properties').find().sort({ created_at: 1 }).toArray();
    return documents.map(serialize);
  },
  addProperty: async (title, price, type, location, image) => {
    const document = { title, price, type, location, image, created_at: new Date() };
    const result = await (await connectDb()).collection('properties').insertOne(document);
    return serialize({ _id: result.insertedId, ...document });
  }
};

async function closeDb() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
  connectionPromise = undefined;
}

module.exports = { connectDb, closeDb, dbAsync };
