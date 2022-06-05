var fs = require("fs");
var util = require("util");
var path = require("path");
var DB_FILE = path.join(__dirname, "../../../..", "db", "posts.json");
var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);

module.exports = async function (req, res, next) {
  var posts = JSON.parse(await readFile(DB_FILE, "utf8"));

  var { [req.params.id]: deletedPost, ...db } = posts;

  if (!deletedPost) {
    return next();
  }

  var data = JSON.stringify(db, "", "\t");
  await writeFile(DB_FILE, data, "utf8");

  res.status(201).send();
};
