const express = require('express');
const path = require('path')
const router = express.Router();
const authController = require('../controllers/authController');
const ensureAuth = require('../middleware/ensureAuth');


router.post('/login', authController.login);
router.post('/register', authController.register);

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, "..", 'views', 'register.html'));
} );

router.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, "..", 'views', 'index.html'));
} );

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "..", 'views', 'login.html'));
} );

router.get('/logout', authController.logout);

module.exports = router;