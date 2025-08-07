const bcrypt = require('bcrypt');
const db = require('../database/db')

exports.register = async (req, res) => {
  const { username, password } = req.body;

  // checks if username exists
  const findSql = 'SELECT id FROM users WHERE username = ?';
  db.get(findSql, [username], async (err, row) => {
    if (err) {
      console.error('db error looking up: ', err);
      return res.status(500).send('internal server error');
    }
    if (row) {
      //exists
      return res.status(400).send('username taken!')
    }

    try {
      const hash = await bcrypt.hash(password, 12);
      const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.run(insertSql, [username, hash], function(err) {
        if (err) {
          console.error('db error on insert: ', err);
          return res.status(500).send('Could not register user');
        }
        res.redirect('/login');
      });
    } catch (hashErr) {
      console.error('hashing error: ', hashErr);
      res.status(500).send('could not register user')
    };

  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT id, password FROM users WHERE username = ?';
  db.get(sql, [username], async (err, row) => {
    if (err) {
      console.error('db error on login lookup: ', err);
      return res.status(500).send('internal server error');
    }
    if (!row) {
      //no user
      return res.redirect('/login?error=true');
    }

    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.redirect('/login?error=true');
    }

    req.session.userId = row.id;
    req.session.user = username;
    res.redirect('/');
  })
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('logout failed')
      res.redirect('/index')
    }
  })
}