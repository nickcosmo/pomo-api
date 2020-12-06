const User = require('../models/user-model.js');

exports.postUser = (req, res, next) => {
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    async function saveUser(user) {
        try {
            const returnUser = await user.save();
            console.log(returnUser);
        }
        catch(err) {
            console.log(err);
        }
    }
    saveUser(newUser);
};