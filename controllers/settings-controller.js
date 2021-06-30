const User = require('../models/user-model.js');

exports.postSettings = async (req, res, next) => {
    const updatedSettings = {
        studyInterval: req.body.studyInterval,
        breakInterval: req.body.breakInterval,
        longBreakInterval: req.body.longBreakInterval,
        dailyGoal: req.body.dailyGoal,
    };

    try {
        let updatedUser = await User.findByIdAndUpdate(req.userId, { settings: updatedSettings }, { new: true }).exec();
        if (updatedUser) {
            res.status(200).json({
                message: 'Post Successful!',
                ...updatedUser._doc,
            });
        } else {
            let err = new Error('No user found!');
            err.statusCode = 404;
            throw err;
        }
        return;
    } catch (err) {
        console.log(err.message);
        if (err.hasOwnProperty('statusCode') == false) {
            err.statusCode = 500;
        }
        next(err);
        return err;
    }
};
