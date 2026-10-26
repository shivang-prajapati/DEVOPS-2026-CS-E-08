const bcrypt = require('bcryptjs');
const { signToken } = require('../config/auth');
const { usersAsync, User } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

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

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await usersAsync.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: passwordHash,
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
  register,
  login,
  getProfile
};
