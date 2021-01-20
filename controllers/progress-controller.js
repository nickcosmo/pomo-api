const User = require("../models/user-model.js");

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