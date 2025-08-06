
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Unauthorized role.' });
    }
    next();
  };
};

export const authorizeSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === parseInt(req.params.id)) {
    return next();
  }
  return res.status(403).json({ error: 'Not authorized' });
};

