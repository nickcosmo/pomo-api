const jwt = require('jsonwebtoken');

exports.autoLogIn = (req, res, next) => {
    try {
        if (req.cookies.hasOwnProperty('jwt') == false) {
            let err = new Error('You are not authorized to make this request!');
            err.statusCode = 401;
            throw err;
        }

        let token = req.cookies.jwt;

        let verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

        if (!verifiedToken) {
            let err = new Error('You are not authorized to make this request!');
            err.statusCode = 401;
            throw err;
        }
        req.userId = verifiedToken._id;
        req.body.email = verifiedToken.email;
        next();
        return;
    } catch (err) {
        // console.log(err);
        err.statusCode = 403;
        next(err);
        return err;
    }
};

exports.authCheck = (req, res, next) => {
    try {
        if (req.cookies.hasOwnProperty('jwt') == false) {
            let err = new Error('You are not authorized to make this request!');
            err.statusCode = 401;
            throw err;
        }

        let token = req.cookies.jwt;
        let verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

        req.userId = verifiedToken._id;
        req.token = token;

        next();
        return;
    } catch (err) {
        // console.log(err.message);
        err.statusCode = 403;
        next(err);
        return err;
    }
};
