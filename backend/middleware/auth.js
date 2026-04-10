const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return async (req, res, next) => {
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'User role not authorized to access this route' });
    }
    next();
  };
};