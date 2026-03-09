const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('Auth failed: No token provided');
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Auth: token decoded for user ID:', decoded.id);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('Auth failed: User not found for ID:', decoded.id);
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    console.log('Auth success: User found:', req.user.username);
    next();
  } catch (err) {
    console.log('Auth failed: Token invalid or expired -', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};
