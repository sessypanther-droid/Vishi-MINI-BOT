const fs = require("fs");
const path = require("path");

const BOT_IMAGE_PATH = path.join(__dirname, "..", "assets", "dtz-vishi-md.png");
const BOT_IMAGE = fs.readFileSync(BOT_IMAGE_PATH);

module.exports = { BOT_IMAGE, BOT_IMAGE_PATH };