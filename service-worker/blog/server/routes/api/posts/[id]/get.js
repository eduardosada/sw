var fs = require("fs");
var path = require("path");
var util = require("util");
var DB_FILE = path.join(__dirname, "../../../..", "db", "posts.json");
var readFile = util.promisify(fs.readFile);

module.exports = async function (req, res, next) {
  var posts = JSON.parse(await readFile(DB_FILE, "utf8"));
  var id = req.params.id;
  var data = posts[id];

  if (!data) {
    return next();
  }

  res.json(data);
};
