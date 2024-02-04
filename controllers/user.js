const fs = require("node:fs/promises");
const path = require("node:path");
const User = require("../models/auth");

async function uploadAvatar(req, res, next) {
  try {
    await fs.rename(
      req.file.path,
      path.join(__dirname, "..", "public/avatars", req.file.filename)
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: req.file.filename,
      },
      { new: true }
    );
    res.send(user);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadAvatar,
};
