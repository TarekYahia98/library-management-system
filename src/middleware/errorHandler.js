const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.errors.map(e => e.message)
    });
  }
  
  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: err.errors.map(e => e.message)
    });
  }
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;