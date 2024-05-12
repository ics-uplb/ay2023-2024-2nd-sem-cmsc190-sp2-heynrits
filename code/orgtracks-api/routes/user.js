const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/auth');

const userController = require('../controllers/user');

router.get('/', [authMiddleware], userController.getUser);
router.post('/register', userController.register);
router.post('/login', userController.login);

module.exports = router;