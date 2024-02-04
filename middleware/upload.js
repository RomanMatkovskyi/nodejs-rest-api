const path = require("node:path");
const crypto = require("node:crypto");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "tmp"));
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname); // .png
    const basename = path.basename(file.originalname, extname); // TrevorPhilips-GTAV
    const suffix = crypto.randomUUID();

    cb(null, `${basename}-${suffix}${extname}`);
  },
});

module.exports = multer({ storage });
