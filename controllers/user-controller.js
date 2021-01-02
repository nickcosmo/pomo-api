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
      res.status(400).json({ error: "User Already Exists!" });
    } else {
      const returnUser = await newUser.save();
      res.status(200).json({
        message: "User was created successfully!",
        ...returnUser._doc,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
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
          { expiresIn: "20s" }
        );
        res.status(200).json({
          message: "Signin Successful!",
          token: token,
          ...foundUser._doc,
        });
      } else {
        res.status(404).json({ message: "Password is Incorrect!" });
      }
    } else {
      res.status(404).json({ message: "No user found!" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
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
      res
        .status(200)
        .json({
          message: "Post Successful!",
          token: req.newToken,
          ...updatedUser._doc,
        });
    } else {
      res.status(404).json({ message: "No user found!" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

// control is incomplete!
exports.deleteUser = (req, res, next) => {
  const userId = req.body.userId;

  try {
    const foundUser = User.findOne({ _id: userId }).exec();
    if (foundUser) {
      const deletedUser = User.deleteOne({_id: foundUser._doc._id.toString()});
      res.status(200).json({message: 'User was deleted successfully.'});
    }
  } catch(err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
