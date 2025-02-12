const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { users, JWT_SECRET } = require('./router/auth_users.js');
const books = require('./router/booksdb.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

// --- the following values should normally be in a .env file ---
const PORT = 5001;
//---------------------------------------------------------------

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log('Request START');
  console.log('Books', books);
  console.log('Users', users);
  next();
});

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  })
);

app.use('/customer/auth/*', function auth(req, res, next) {
  if (!req.session.accessToken) {
    return res.status(401).send('Unauthorized');
  }
  const tokenIsValid = jwt.verify(req.session.accessToken, JWT_SECRET);
  if (tokenIsValid) {
    return next();
  }
  return res.status(401).send('Unauthorized');
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log('Server is running'));
