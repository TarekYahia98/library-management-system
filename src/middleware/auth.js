const auth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'Unauthorized: API key is required'
    });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid API key'
    });
  }
  
  next();
};

module.exports = auth;