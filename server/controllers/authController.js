const bcrypt = require('bcryptjs');
const { signToken } = require('../config/auth');
const { sendSuccess, sendError } = require('../utils/response');

const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@estatex.com',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'admin'
  },
  {
    id: 2,
    name: 'Agent User',
    email: 'agent@estatex.com',
    password: bcrypt.hashSync('Agent@123', 10),
    role: 'agent'
  },
  {
    id: 3,
    name: 'Manager User',
    email: 'manager@estatex.com',
    password: bcrypt.hashSync('Manager@123', 10),
    role: 'manager'
  },
  {
    id: 4,
    name: 'Client User',
    email: 'client@estatex.com',
    password: bcrypt.hashSync('Client@123', 10),
    role: 'client'
  }
];

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required.');
    }

    const existingUser = users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
    if (existingUser) {
      return sendError(res, 409, 'User already exists.');
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: bcrypt.hashSync(password, 10),
      role: role || 'client'
    };

    users.push(newUser);

    const token = signToken(newUser);

    return sendSuccess(res, 201, {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    }, 'User registered successfully.');
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase());
    if (!user) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    const token = signToken(user);

    return sendSuccess(res, 200, {
      user: {
        id: user.id,
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

const getProfile = (req, res) => {
  const user = users.find((item) => item.id === req.user.id);

  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  return sendSuccess(res, 200, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }, 'Profile fetched successfully.');
};

module.exports = {
  register,
  login,
  getProfile
};
