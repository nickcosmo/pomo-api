// TODO:
// refresh token route --> do this last
// update account info route --> may not be required!

const express = require("express");
const { check } = require("express-validator");
const userController = require("../controllers/user-controller.js");
const settingsController = require("../controllers/settings-controller.js");
const progressController = require("../controllers/progress-controller.js");
const auth = require("../middleware/auth.js");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send("Jesse iz gay!");
})

router.put(
  "/sign-up",
  [
    check("name", "Invalid Name").trim().isLength({ min: 1 }),
    check("email", "Invalid Email")
      .isEmail()
      .isLength({ min: 1 })
      .normalizeEmail(),
    check("password", "Invalid Password").trim().isLength({ min: 6, max: 35 }),
    check("verifyPassword", "Password could not be verified").custom(
      (value, { req }) => {
        if (value === req.body.password) {
          return true;
        }
        throw new Error("Passwords must match!");
      }
    ),
  ],
  userController.putUser
);

router.post(
  "/log-in",
  [
    check("email", "Invalid Email")
      .isEmail()
      .isLength({ min: 1 })
      .normalizeEmail(),
    check("password", "Invalid Password").trim().isLength({ min: 6, max: 35 }),
  ],
  userController.postLogIn
);

router.post("/auto-log-in", auth.autoLogIn, userController.postAutoLogIn);

router.post("/update-settings", auth.authCheck, settingsController.postSettings);

router.post("/update-hours", auth.authCheck, progressController.postHours);

router.get("/get-hours", auth.authCheck, progressController.getHours);

router.get("/log-out", auth.authCheck, userController.postLogOut);

router.delete("/delete-user", auth.authCheck, userController.deleteUser);

module.exports = router;
