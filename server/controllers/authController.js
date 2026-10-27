const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken } = require('../config/auth');
const { usersAsync, User } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

const createInitialAdmin = async (req, res) => {
  const expectedKey = process.env.ADMIN_SETUP_KEY;
  const setupKey = typeof req.body.setupKey === 'string' ? req.body.setupKey : '';

  if (!expectedKey) {
    return sendError(res, 503, 'Administrator setup is not enabled.');
  }

  const providedBuffer = Buffer.from(setupKey);
  const expectedBuffer = Buffer.from(expectedKey);
  const keyMatches = providedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!keyMatches) {
    return sendError(res, 403, 'Invalid administrator setup key.');
  }

  try {
    if (await User.exists({ role: 'admin' })) {
      return sendError(res, 409, 'An administrator account already exists.');
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }
    if (String(password).length < 12) {
      return sendError(res, 400, 'Administrator password must be at least 12 characters.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (await usersAsync.getByEmail(normalizedEmail)) {
      return sendError(res, 409, 'An account already uses this email address.');
    }

    const admin = await usersAsync.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: 'admin'
    });

    return sendSuccess(res, 201, {
      user: {
        id: admin._id || admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      token: signToken(admin)
    }, 'Administrator account created. Store the password securely and remove ADMIN_SETUP_KEY from Render.');
  } catch (error) {
    if (error && (error.code === 11000 || error.code === '11000')) {
      return sendError(res, 409, 'An account already uses this email address.');
    }
    return sendError(res, 500, error.message);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await usersAsync.getByEmail(normalizedEmail);
    if (existingUser) {
      return sendError(res, 409, 'User already exists.');
    }

    const newUser = await usersAsync.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      role: 'client'
    });

    const token = signToken(newUser);

    return sendSuccess(res, 201, {
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    }, 'User registered successfully.');
  } catch (error) {
    if (error && (error.code === 11000 || error.code === '11000')) {
      return sendError(res, 409, 'User already exists.');
    }
    return sendError(res, 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await usersAsync.getByEmail(normalizedEmail);
    if (!user) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    const token = signToken(user);

    return sendSuccess(res, 200, {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Login successful.');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    return sendSuccess(res, 200, {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }, 'Profile fetched successfully.');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createInitialAdmin,
  register,
  login,
  getProfile
};
