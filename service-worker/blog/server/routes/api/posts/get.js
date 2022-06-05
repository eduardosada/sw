var fs = require("fs");
var path = require("path");
var util = require("util");
var DB_FILE = path.join(__dirname, "../../../", "db", "posts.json");
var readFile = util.promisify(fs.readFile);

module.exports = async function (req, res, next) {
  var posts = JSON.parse(await readFile(DB_FILE, "utf8"));

  var data = Object.values(posts).sort(function (a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  res.json(data);
};
