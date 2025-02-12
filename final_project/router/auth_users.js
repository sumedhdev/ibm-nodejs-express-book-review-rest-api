const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];
const JWT_SECRET = '15ug0t14iutho24u';

const isValid = (username) => {
  return (
    !usernameExists(username) && // username does not already exist
    username.length > 3 && // min 4 characters
    username.length < 20 && // max 20 characters
    /^[a-zA-Z0-9]+$/.test(username) // alphanumeric
  );
};

// write code to check if username and password match the one we have in records.
// returns boolean
const usernameAndPasswordMatches = (username, password) => {
  return !!users.find(
    (u) => u.username === username && u.password === password
  );
};

// write code to check if username and password match the one we have in records.
// returns boolean
const usernameExists = (username) => {
  return !!users.find((u) => u.username === username);
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  // if username does not exist, return 404
  if (!username || !password) {
    return res.status(400).send('Username or password is missing');
  }
  // if username and password match, return a jwt token
  if (usernameAndPasswordMatches(username, password)) {
    const accessToken = jwt.sign({ username }, JWT_SECRET, {
      expiresIn: '1h',
    });
    req.session.accessToken = accessToken;
    req.session.username = username;
    return res.send({ accessToken });
  }
  // if username and password do not match, return 401
  return res.status(401).send('Unauthorized');
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  if (!books[isbn]) {
    return res.status(404).send('Book not found');
  }
  const { review } = req.body;
  if (!review) {
    return res.status(400).send('Review is missing');
  }
  books[isbn].reviews[req.session.username] = review;
  return res.sendStatus(200);
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const matchingBook = books[isbn];
  if (!matchingBook) {
    return res.status(404).send('Book not found');
  }
  delete matchingBook.reviews[req.session.username];
  return res.sendStatus(204);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.usernameExists = usernameExists;
module.exports.JWT_SECRET = JWT_SECRET;
