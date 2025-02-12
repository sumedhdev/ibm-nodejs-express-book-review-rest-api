const express = require('express');
let books = require('./booksdb.js');
const { usernameExists } = require('./auth_users.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username or password is missing');
  }
  if (usernameExists(username)) {
    return res.status(400).send('Username already exists');
  }
  if (!isValid(username)) {
    return res.status(400).send('Invalid username');
  }
  const newUser = { username, password };
  users.push(newUser);
  return res.sendStatus(201);
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const queryISBN = req.params.isbn;
  const matchingBook = books[queryISBN];
  if (matchingBook) {
    return res.send(matchingBook);
  }
  return res.status(404).send('No book found for that ISBN');
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const queryAuthor = req.params.author;
  let matchingBooks = [];
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === queryAuthor) {
      matchingBooks.push(books[isbn]);
    }
  });
  if (matchingBooks.length > 0) {
    return res.send(matchingBooks);
  }
  return res.status(404).send('No book found for that author');
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const queryTitle = req.params.title;
  let matchingBooks = [];
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === queryTitle) {
      matchingBooks.push(books[isbn]);
    }
  });
  if (matchingBooks.length > 0) {
    return res.send(matchingBooks);
  }
  return res.status(404).send('No book found for that title');
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const queryISBN = req.params.isbn;
  const matchingBook = books[queryISBN];
  if (matchingBook) {
    return res.send(matchingBook.reviews);
  }
  return res.status(404).send('No book found for that ISBN');
});

module.exports.general = public_users;
