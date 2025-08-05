const bcrypt = require('bcrypt');
const users = {};

exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) return res.status(400).send('Username taken');

  const hash = await bcrypt.hash(password, 12);
  users[username] = { password: hash };
  res.redirect('/login');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.redirect('/login?error=true');
  }

  req.session.user = username;
  res.redirect('/');
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('logout failed')
      res.redirect('/index')
    }
  })
}