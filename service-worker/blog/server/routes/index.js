var express = require("express");
var router = express.Router();
var path = require("path");
var DIR_PUBLIC = path.join(__dirname, "../../public");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/", async function (req, res, next) {
  await delay(200);
  res.sendFile("index.html", { root: DIR_PUBLIC });
});

router.get("/admin", function (req, res, next) {
  res.sendFile("admin.html", { root: DIR_PUBLIC });
});

router.get("/blog", async function (req, res, next) {
  await delay(200);
  res.sendFile("blog.html", { root: DIR_PUBLIC });
});

router.get("/contact", async function (req, res, next) {
  await delay(200);
  res.sendFile("contact.html", { root: DIR_PUBLIC });
});

router.get("/blog/:id", async function (req, res, next) {
  await delay(200);
  res.sendFile("blog-[id].html", { root: DIR_PUBLIC });
});

router.get("/api/posts/:id", require("./api/posts/[id]/get"));
router.patch("/api/posts/:id", require("./api/posts/[id]/patch"));
router.delete("/api/posts/:id", require("./api/posts/[id]/delete"));
router.get("/api/posts", require("./api/posts/get"));
router.post("/api/posts", require("./api/posts/post"));

module.exports = router;
