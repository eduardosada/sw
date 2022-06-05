var uuid = require("uuid");
var fs = require("fs");
var path = require("path");
var util = require("util");
var DB_FILE = path.join(__dirname, "../../../", "db", "posts.json");
var readFile = util.promisify(fs.readFile);
var writeFile = util.promisify(fs.writeFile);

module.exports = async function (req, res, next) {
  var posts = JSON.parse(await readFile(DB_FILE, "utf8"));
  if (!req.body.title || !req.body.body) {
    return next();
  }

  var newPost = {
    id: uuid.v4(),
    title: req.body.title,
    body: req.body.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  var db = {
    ...posts,
    [newPost.id]: newPost,
  };

  console.log(db);

  var data = JSON.stringify(db, "", "\t");
  await writeFile(DB_FILE, data, "utf8");
  res.json(newPost);
};
