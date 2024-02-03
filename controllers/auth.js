const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/auth");
const userSchema = require("../schemas/user");

async function register(req, res, next) {
  const { email, password } = req.body;
  console.log("EMAIL", email);

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
    await Auth.create({ email, password: hashPass });
    res.status(201).send({
      user: {
        email: email,
        subcription: "starter",
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
    console.log("TOKEN", token);
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

module.exports = {
  register,
  login,
  logout,
  currentUser,
};
