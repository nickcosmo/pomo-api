const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let headerToken = req.get("Authorization");

  if (!headerToken) {
    return res
      .status(401)
      .json({ message: "You are not authorized to make this request!" });
  }

  headerToken = req.get("Authorization").split(" ")[1];

  let verifiedToken;

  try {
    verifiedToken = jwt.verify(headerToken, process.env.ACCESS_TOKEN);
  } catch (err) {
    return res.status(403).json({ message: err.message });
  }
  if (!verifiedToken) {
    return res
      .status(401)
      .json({ message: "You are not authorized to make this request!" });
  }
  req.userId = verifiedToken._id;
  req.newToken = jwt.sign(
    {
      email: verifiedToken.email,
      _id: verifiedToken._id.toString(),
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "20s" }
  );
  next();
};
