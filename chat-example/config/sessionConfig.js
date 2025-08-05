const session = require('express-session');

module.exports = session({
  secret: 'squandangledingle',  
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
});