const User = require("../models/user-model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.putUser = async (req, res, next) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    settings: {
      studyInterval: 25,
      breakInterval: 5,
      longBreakInterval: 15,
    },
    progress: {
      totalHours: 0,
      todaysHours: 0,
    },
  });

  let hashedPassword = await bcrypt.hash(newUser.password, 12);
  newUser.password = hashedPassword;

  try {
    const foundUser = await User.findOne({ email: newUser.email }).exec();
    if (foundUser) {
      let err = new Error('User already Exists!');
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
    throw err;
  }
};

exports.postLogIn = async (req, res, next) => {
  let userData = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const foundUser = await User.findOne({
      email: userData.email,
    }).exec();
    if (foundUser) {
      const authCheck = await bcrypt.compare(
        userData.password,
        foundUser.password
      );
      if (authCheck) {
        const token = jwt.sign(
          {
            email: foundUser.email,
            _id: foundUser._id.toString(),
          },
          process.env.ACCESS_TOKEN,
          { expiresIn: process.env.ACCESS_EXPIRE.toString() }
        );
        res.cookie("jwt", token, { secure: false, httpOnly: true });
        res.status(200).json({
          message: "Signin Successful!",
          ...foundUser._doc,
        });
      } else {
        let err = new Error('Password is Incorrect!');
        err.statusCode = 404;
        throw err;
      }
    } else {
      let err = new Error('Email is Incorrect!');
      err.statusCode = 404;
      throw err;
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    throw err;
  }
};

exports.postLogOut = async (req, res, next) => {
  const userId = req.userId;

  try {
    const foundUser = User.findOne({ _id: userId });
    if (foundUser) {
      res.clearCookie("jwt");
      res.status(200).json({ message: "Logout Successful!" });
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    throw err;
  }
};

exports.postSettings = async (req, res, next) => {
  const updatedSettings = {
    studyInterval: req.body.studyInterval,
    breakInterval: req.body.breakInterval,
    longBreakInterval: req.body.longBreakInterval,
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
      let err = new Error('No user found!');
      err.statusCode = 404;
      throw err;
    }
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    throw err;
  }
};

exports.deleteUser = (req, res, next) => {
  const userId = req.userId;

  try {
    User.deleteOne({ _id: userId }, (err) => {
      if(err) {
        console.log(err.message);
        err.statusCode = 500;
        throw err;
      }
      res.status(200).json({ message: "User was deleted successfully." });
    });
  } catch (err) {
    console.log(err.message);
    err.statusCode = 500;
    throw err;
  }
};
