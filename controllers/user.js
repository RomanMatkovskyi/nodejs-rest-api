const fs = require('node:fs/promises');
const path = require('node:path');
const User = require('../models/auth');
const Jimp = require('jimp');
const { error } = require('node:console');

async function getAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user.id);

    if (user === null) {
      return res.status(404).send({ message: 'Not found' });
    }
    if (user.avatarURL === null) {
      return res.status(404).send({ message: 'Avatar not found' });
    }

    res.sendFile(path.join(__dirname, '..', 'public/avatars', user.avatarURL));
  } catch (error) {
    next(error);
  }
}
async function uploadAvatar(req, res, next) {
  if (req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
    fs.unlink(req.file.path, err => {
      if (err) {
        return res.status(500).send({ message: 'Internal Server Error' });
      }
    });
    return res
      .status(400)
      .send({ message: 'Please download valid image file' });
  }

  try {
    await fs.rename(
      req.file.path,
      path.join(__dirname, '..', 'public/avatars', req.file.filename)
    );

    Jimp.read(path.join(__dirname, '..', 'public/avatars', req.file.filename))
      .then(image => {
        return image
          .resize(250, 250)
          .write(
            path.join(__dirname, '..', 'public/avatars', req.file.filename)
          );
      })
      .catch(err => {
        console.log('ERROR_HERE', err);
        return res
          .status(400)
          .send({ message: 'Please download valid image file' });
      });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatarURL: req.file.filename,
      },
      { new: true }
    );
    res.status(200).send({ avatarURL: user.avatarURL });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAvatar,
  uploadAvatar,
};
