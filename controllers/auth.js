const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const crypto = require("node:crypto");

const Auth = require("../models/auth");
const userSchema = require("../schemas/user");
const sendEmail = require("../helpers/sendEmail");

async function register(req, res, next) {
  const { email, password } = req.body;

  const response = userSchema.validate(req.body, {
    abortEarly: false,
  });
  if (response.error) {
    return res.status(400).send({
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }

  try {
    const user = await Auth.findOne({ email });
    if (user !== null) {
      return res.status(409).send({ message: "Email in use" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const avatarUrl = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "identicon",
    });

    const verificationToken = crypto.randomUUID();
    const message = {
      from: "<foo@example.com>",
      to: email,
      subject: "TEST Hello",
      html: `To verify your account please click on the link <a href="http://localhost:3000/api/users/verify/${verificationToken}">LINK</a>`,
      text: `To verify your account please click on the link http://localhost:3000/api/users/verify/${verificationToken}`,
    };

    await sendEmail(message);
    await Auth.create({
      email,
      password: hashPass,
      avatarURL: avatarUrl,
      verificationToken,
    });

    res.status(201).send({
      user: {
        email: email,
        subcription: "starter",
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  const response = userSchema.validate(req.body, {
    abortEarly: false,
  });
  if (response.error) {
    return res.status(400).send({
      message: `missing required ${response.error.details
        .map((err) => err.message)
        .join(", ")} field`,
    });
  }

  try {
    const user = await Auth.findOne({ email });
    if (user === null) {
      return res.status(401).send({
        message: "Email or password is wrong",
      });
    }
    if (user.verify === false) {
      return res
        .status(401)
        .send({ message: "Please verify your email first" });
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      return res.status(401).send({
        message: "Email or password is wrong",
      });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: 60 * 60,
    });
    await Auth.findByIdAndUpdate(user._id, { token });
    res.send({
      token,
      user: {
        email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await Auth.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function currentUser(req, res, next) {
  const { id } = req.user;
  try {
    const user = await Auth.findById(id);
    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const { email, subscription } = user;
    res.status(200).send({ email, subscription });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  const { verificationToken } = req.params;

  try {
    const user = await Auth.findOne({ verificationToken });

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    await Auth.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });
    res.status(200).send({ message: "Verification successfull" });
  } catch (error) {
    next(error);
  }
}

async function reVerify(req, res, next) {
  const { email } = req.body;
  if (email === null || email === undefined) {
    return res.status(400).send({ message: "Missing required field email" });
  }
  try {
    const emailTrim = email.trim();
    const user = await Auth.findOne({ email: emailTrim });
    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.verify === true) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }

    const verificationToken = crypto.randomUUID();
    const message = {
      from: "<foo@example.com>",
      to: emailTrim,
      subject: "TEST Hello",
      html: `To verify your account please click on the link <a href="http://localhost:3000/api/users/verify/${verificationToken}">LINK</a>`,
      text: `To verify your account please click on the link http://localhost:3000/api/users/verify/${verificationToken}`,
    };
    await sendEmail(message);
    await Auth.findByIdAndUpdate(user._id, { verificationToken });

    res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  currentUser,
  verify,
  reVerify,
};
