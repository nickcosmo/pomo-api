const express = require("express");

const userController = require("../controllers/user-controller.js");
const authCheck = require("../middleware/auth.js");

const router = express.Router();

router.put("/sign-up", userController.putUser);

router.post("/log-in", userController.postLogIn);

router.post("/update-settings", authCheck, userController.postSettings);

router.delete("/delete-user", userController.deleteUser);

module.exports = router;
