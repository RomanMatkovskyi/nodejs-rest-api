const jwt = require("jsonwebtoken");
const Auth = require("../models/auth");

function auth(req, res, next) {
  const headerAuth = req.headers.authorization;

  if (typeof headerAuth === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }

  const [bearer, token] = headerAuth.split(" ");
  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }
    const user = await Auth.findById(decode.id);

    if (user === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    if (user.token !== token) {
      return res.status(401).send({ message: "Not authorized" });
    }

    req.user = {
      id: decode.id,
      email: decode.email,
    };
    next();
  });
}

module.exports = auth;
