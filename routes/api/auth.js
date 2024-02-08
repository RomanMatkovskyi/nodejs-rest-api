const express = require("express");

const AuthController = require("../../controllers/auth");
const AuthMiddleware = require("../../middleware/auth");

const router = express.Router();
const jsonParser = express.json();

router.post("/register", jsonParser, AuthController.register);
router.post("/login", jsonParser, AuthController.login);
router.post("/logout", AuthMiddleware, AuthController.logout);
router.get("/current", AuthMiddleware, AuthController.currentUser);
router.get("/verify/:verificationToken", AuthController.verify);
router.post("/verify", AuthController.reVerify);
module.exports = router;
