const express = require('express');
const session = require('express-session');
const router = require('./routes');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'tripnesia-super-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})