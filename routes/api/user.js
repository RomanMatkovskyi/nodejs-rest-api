const express = require('express');
const userController = require('../../controllers/user');
const uploadMiddleware = require('../../middleware/upload');

const router = express.Router();

router.get('/avatars', userController.getAvatar);

router.patch(
  '/avatars',
  uploadMiddleware.single('avatar'),
  userController.uploadAvatar
);

module.exports = router;
