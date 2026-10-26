const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const isSupabaseConfigured = false;
const isProduction = process.env.NODE_ENV === 'production';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estatex';

const db = mongoose.connection;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('Connected to MongoDB at:', MONGODB_URI);
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    if (isProduction) {
      throw error;
    }
    return null;
  }
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['client', 'agent', 'manager', 'admin'],
    default: 'client'
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'users' });

userSchema.pre('save', async function nextHook() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  image: { type: String, default: './assets/images/property-1.jpg' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'properties' });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'contacts' });

const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  property_id: { type: String, default: '' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'enquiries' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);

const seedProperties = async () => {
  const count = await Property.countDocuments();
  if (count === 0) {
    await Property.insertMany([
      {
        title: 'New Apartment Nice View',
        price: '$30,000/Month',
        type: 'Apartment',
        location: 'Belmont Gardens, Chicago',
        image: './assets/images/property-1.jpg'
      },
      {
        title: 'Modern Apartments',
        price: '$45,000/Month',
        type: 'Apartment',
        location: 'Rego Park, New York',
        image: './assets/images/property-2.jpg'
      },
      {
        title: 'Luxury villa in Rego Park',
        price: '$85,000/Month',
        type: 'Villa',
        location: 'Rego Park, New York',
        image: './assets/images/property-3.jpg'
      }
    ]);
  }
};

const usersAsync = {
  getByEmail: async (email) => {
    const user = await User.findOne({ email }).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },
  getById: async (id) => {
    const user = await User.findById(id).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },
  create: async ({ name, email, password, role = 'client' }) => {
    const user = await User.create({ name, email, password, role });
    const payload = user.toObject();
    payload.id = payload._id.toString();
    return payload;
  }
};

const dbAsync = {
  addContact: async (name, email, subject, message) => {
    const contact = await Contact.create({ name, email, subject: subject || '', message });
    const payload = contact.toObject();
    payload.id = payload._id.toString();
    return payload;
  },
  getContacts: async () => Contact.find().sort({ createdAt: -1 }).lean().then(rows => rows.map(row => ({ ...row, id: row._id.toString() }))),
  addEnquiry: async (name, email, phone, property_id, message) => {
    const enquiry = await Enquiry.create({ name, email, phone: phone || '', property_id: property_id || '', message });
    const payload = enquiry.toObject();
    payload.id = payload._id.toString();
    return payload;
  },
  getEnquiries: async () => Enquiry.find().sort({ createdAt: -1 }).lean().then(rows => rows.map(row => ({ ...row, id: row._id.toString() }))),
  getProperties: async () => Property.find().sort({ createdAt: 1 }).lean().then(rows => rows.map(row => ({ ...row, id: row._id.toString() }))),
  addProperty: async (title, price, type, location, image) => {
    const property = await Property.create({ title, price, type, location, image: image || './assets/images/property-1.jpg' });
    const payload = property.toObject();
    payload.id = payload._id.toString();
    return payload;
  }
};

module.exports = {
  db,
  connectDB,
  seedProperties,
  dbAsync,
  usersAsync,
  User,
  Property,
  Contact,
  Enquiry,
  isSupabaseConfigured
};
