// TODO:
// post hours route --> do this on current update route?
// refresh token route --> do this last
// update account info route --> do this on current update route?

const express = require("express");

const userController = require("../controllers/user-controller.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.put("/sign-up", userController.putUser);

router.post("/log-in",  userController.postLogIn);

router.post("/auto-log-in", auth.autoLogIn, userController.postAutoLogIn);

router.post("/update-settings", auth.authCheck, userController.postSettings);

router.get("/log-out", auth.authCheck, userController.postLogOut);

router.delete("/delete-user", auth.authCheck, userController.deleteUser);

module.exports = router;
