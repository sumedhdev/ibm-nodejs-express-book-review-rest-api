const jwt = require('jsonwebtoken');
const { PORT, JWT_SECRET } = require('./config.js');
const { protectedRoutes } = require('./router/auth_users.js');
const { publicRoutes } = require('./router/general.js');

const express = require('express');
const app = express();
app.use(express.json());

/**
 * Check if request has a valid access token.
 * If it is valid then decode the token and assign username and accessToken to the
 * request object for subsequent middleware/route handlers; else return 401 Unauthorized.
 */
const authenticationMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .send('Unauthorized: Bearer token not found in Authorization header');
  }
  const accessToken = authHeader.split(' ')[1];
  try {
    // jwt.verify - Verifies synchronously. Returns the payload decoded if the signature is valid and optional expiration, audience, or issuer are valid. If not, it will throw error. Source: https://github.com/auth0/node-jsonwebtoken
    const payload = jwt.verify(accessToken, JWT_SECRET);
    if (payload) {
      req.username = payload.username;
      req.accessToken = accessToken;
      return next();
    }
    return res.status(401).send('Unauthorized: Invalid token');
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).send('Unauthorized: Invalid token');
  }
};

app.use('/customer/auth/*', authenticationMiddleware);
app.use('/customer', protectedRoutes);
app.use('/', publicRoutes);

app.listen(PORT, () => {
  if (!JWT_SECRET) {
    // this check is more relevant where JWT_SECRET comes from a .env file
    console.error('JWT_SECRET is not set');
    process.exit(1);
  }
  console.log(`Server is running on port ${PORT}`);
});
