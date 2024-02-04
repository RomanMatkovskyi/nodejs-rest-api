const express = require('express');
const router = express.Router();

const tokenAuth = require('../../middleware/auth');

const contactsRoute = require('./contacts');
const authRouter = require('./auth');
const userRouter = require('./user');

router.use('/contacts', tokenAuth, contactsRoute);
router.use('/users', authRouter);
router.use('/users', tokenAuth, userRouter);

module.exports = router;
