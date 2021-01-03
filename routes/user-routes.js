// TODO:
// post hours route --> do this on current update route?
// refresh token route --> do this last
// update account info route --> do this on current update route?

const express = require("express");

const userController = require("../controllers/user-controller.js");
const authCheck = require("../middleware/auth.js");

const router = express.Router();

router.put("/sign-up", userController.putUser);

router.post("/log-in", userController.postLogIn);

router.post("/update-settings", authCheck, userController.postSettings);

router.post("/log-out", authCheck, userController.postLogOut);

router.delete("/delete-user", authCheck, userController.deleteUser);

module.exports = router;
