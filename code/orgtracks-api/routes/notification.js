const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/auth');

const notifController = require('../controllers/notification');

router.get('/', [authMiddleware], notifController.getNotifsByUser);
router.put('/:notifId/read', [authMiddleware], notifController.markAsRead);


module.exports = router;