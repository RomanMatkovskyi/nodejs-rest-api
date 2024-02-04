const express = require("express");
const userController = require("../../controllers/user");
const uploadMiddleware = require("../../middleware/upload");

const router = express.Router();

router.patch(
  "/avatar",
  uploadMiddleware.single("avatar"),
  userController.uploadAvatar
);

module.exports = router;
