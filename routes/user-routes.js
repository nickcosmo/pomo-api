const express = require("express");

const userController = require("../controllers/user-controller.js");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ hello: "hello" });
});

router.post("/new-user", userController.postUser);

module.exports = router;
