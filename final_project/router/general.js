const express = require('express');
let { fetchBooks } = require('./booksdb.js');
const { usernameExists } = require('./auth_users.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const publicRoutes = express.Router();

publicRoutes.post('/register', (req, res) => {
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

/** Get the book list available in the shop  */
publicRoutes.get('/', async (req, res) => {
  const books = await fetchBooks();
  return res.send(books);
});

/** Get book details based on ISBN  */
publicRoutes.get('/isbn/:isbn', async (req, res) => {
  const queryISBN = req.params.isbn;
  const books = await fetchBooks();
  const matchingBook = books[queryISBN];
  if (matchingBook) {
    return res.send(matchingBook);
  }
  return res.status(404).send('No book found for that ISBN');
});

/** Get book details based on author  */
publicRoutes.get('/author/:author', async (req, res) => {
  const queryAuthor = req.params.author;
  const books = await fetchBooks();
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

/** Get all books based on title  */
publicRoutes.get('/title/:title', async (req, res) => {
  const queryTitle = req.params.title;
  const books = await fetchBooks();
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

/** Get book review  */
publicRoutes.get('/review/:isbn', async (req, res) => {
  const queryISBN = req.params.isbn;
  const books = await fetchBooks();
  const matchingBook = books[queryISBN];
  if (matchingBook) {
    return res.send(matchingBook.reviews);
  }
  return res.status(404).send('No book found for that ISBN');
});

module.exports.publicRoutes = publicRoutes;
