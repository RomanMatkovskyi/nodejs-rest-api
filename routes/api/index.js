const express = require("express");
const router = express.Router();

const tokenAuth = require("../../middleware/auth");

const contactsRoute = require("./contacts");
const authRouter = require("./auth");

router.use("/contacts", tokenAuth, contactsRoute);
router.use("/users", authRouter);

module.exports = router;
