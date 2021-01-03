const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    let err = new Error('You are not authorized to make this request!');
    err.statusCode = 401;
    throw err;
  }

  let verifiedToken;

  try {
    verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    console.log(err);
    err.statusCode = 403;
    throw err;
  }
  if (!verifiedToken) {
    let err = new Error('You are not authorized to make this request!');
    err.statusCode = 401;
    throw err;
  }
  req.userId = verifiedToken._id;
  req.token = token;
  next();
};
