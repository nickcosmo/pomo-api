const User = require("../models/user-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.putUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // const err = new Error("Validation Failed!");
    // err.data = errors.array();
    // err.statusCode = 422;
    // throw err;
    return res
      .status(422)
      .json({ message: "Validation Failed!", data: errors.array() });
  }

  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    settings: {
      studyInterval: 25,
      breakInterval: 5,
      longBreakInterval: 15,
      dailyGoal: 0,
    },
    progress: {
      totalHours: 0,
      todaysHours: 0,
      weekHours: 0,
      week: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      },
    },
  });

  let hashedPassword = await bcrypt.hash(newUser.password, 12);
  newUser.password = hashedPassword;

  try {
    const foundUser = await User.findOne({ email: newUser.email }).exec();
    if (foundUser) {
      let err = new Error("User already Exists!");
      err.statusCode = 400;
      throw err;
    } else {
      const returnUser = await newUser.save();
      res.status(200).json({
        message: "User was created successfully!",
        ...returnUser._doc,
      });
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.postLogIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation Failed!", data: errors.array() });
  }

  try {
    const foundUser = await User.findOne({
      email: req.body.email,
    }).exec();
    if (foundUser) {
      const authCheck = await bcrypt.compare(
        req.body.password,
        foundUser.password
      );
      if (authCheck) {
        const token = jwt.sign(
          {
            email: foundUser.email,
            password: foundUser.password,
            _id: foundUser._id.toString(),
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: process.env.ACCESS_EXPIRE.toString() }
        );
        res
          .status(200)
          .cookie("jwt", token, {
            secure: false,
            httpOnly: true,
            maxAge: 4.32e7,
          })
          .json({
            message: "Signin Successful!",
            ...foundUser._doc,
          });
      } else {
        let err = new Error("Password is Incorrect!");
        err.statusCode = 404;
        next(err);
      }
    } else {
      let err = new Error("Email is Incorrect!");
      err.statusCode = 404;
      next(err);
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.postAutoLogIn = async (req, res, next) => {
  try {
    const foundUser = await User.findOne({
      email: req.body.email,
    }).exec();
    if (foundUser) {
      if (req.body.password === foundUser.password) {
        const token = jwt.sign(
          {
            email: foundUser.email,
            password: foundUser.password,
            _id: foundUser._id.toString(),
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: process.env.ACCESS_EXPIRE.toString() }
        );
        res
          .status(200)
          .cookie("jwt", token, {
            secure: false,
            httpOnly: true,
            maxAge: 4.32e7,
          })
          .json({
            message: "Signin Successful!",
            ...foundUser._doc,
          });
      } else {
        let err = new Error("auto log in: Password is Incorrect!");
        err.statusCode = 404;
        next(err);
      }
    } else {
      let err = new Error("auto log in: Email is Incorrect!");
      err.statusCode = 404;
      next(err);
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.postLogOut = async (req, res, next) => {
  const userId = req.userId;

  try {
    const foundUser = await User.findOne({ _id: userId });
    if (foundUser) {
      res.clearCookie("jwt");
      res.status(200).json({ message: "Log Out Successful!" });
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.postSettings = async (req, res, next) => {
  const updatedSettings = {
    studyInterval: req.body.studyInterval,
    breakInterval: req.body.breakInterval,
    longBreakInterval: req.body.longBreakInterval,
    dailyGoal: req.body.dailyGoal,
  };

  try {
    let updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { settings: updatedSettings },
      { new: true }
    ).exec();
    if (updatedUser) {
      res.status(200).json({
        message: "Post Successful!",
        ...updatedUser._doc,
      });
    } else {
      let err = new Error("No user found!");
      err.statusCode = 404;
      next(err);
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.postHours = async (req, res, next) => {
  const hours = req.body.hours;

  try {
    let userData = await User.findOne({ _id: req.userId });

    let day = new Date();
    const today = day.getDay();
    const latestDay = userData.updatedAt.getDay();

    if (latestDay !== today) {
      userData.progress.todaysHours = 0;
    } else {
      userData.progress.todaysHours = userData.progress.todaysHours + hours;
    }

    if (latestDay === 0 && latestDay !== today) {
      userData.progress.weekHours = 0;
    } else {
      userData.progress.weekHours = userData.progress.weekHours + hours;
    }

    userData.progress.totalHours = userData.progress.totalHours + hours;

    if (today === 0) {
      userData.progress.week.sunday = userData.progress.week.sunday + hours;
    } else if (today === 1) {
      userData.progress.week.monday = userData.progress.week.monday + hours;
    } else if (today === 2) {
      userData.progress.week.tuesday = userData.progress.week.tuesday + hours;
    } else if (today === 3) {
      userData.progress.week.wednesday =
        userData.progress.week.wednesday + hours;
    } else if (today === 4) {
      userData.progress.week.thursday = userData.progress.week.thursday + hours;
    } else if (today === 5) {
      userData.progress.week.friday = userData.progress.week.friday + hours;
    } else if (today === 6) {
      userData.progress.week.saturday = userData.progress.week.saturday + hours;
    }

    let updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { progress: userData.progress },
      { new: true }
    ).exec();

    if (updatedUser) {
      res.status(200).json({
        message: "Post Successful!",
        ...updatedUser._doc,
      });
    } else {
      let err = new Error("No user found!");
      err.statusCode = 404;
      next(err);
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.getHours = async (req, res, next) => {
  try {
    let userData = await User.findOne({ _id: req.userId });

    // reset day and weekly hours if applicable
    let day = new Date();
    const today = day.getDay();
    const latestDay = userData.updatedAt.getDay();

    if (latestDay !== today) {
      userData.progress.todaysHours = 0;
    }

    if (latestDay === 0 && latestDay !== today) {
      userData.progress.weekHours = 0;
    }

    let updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { progress: userData.progress },
      { new: true }
    ).exec();

    if (updatedUser) {
      res.status(200).json({
        message: "Successful!",
        dailyGoal: userData.settings.dailyGoal,
        ...userData.progress,
      });
    } else {
      let err = new Error("No user found!");
      err.statusCode = 404;
      next(err);
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};

exports.deleteUser = (req, res, next) => {
  const userId = req.userId;

  try {
    User.deleteOne({ _id: userId }, (err) => {
      if (err) {
        console.log(err.message);
        err.statusCode = 500;
        throw err;
      }
      res.status(200).json({ message: "User was deleted successfully." });
    });
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    next(err);
  }
};
