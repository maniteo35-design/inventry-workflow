const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
    if (!token) return res.status(401).json({ message: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user || !user.active) return res.status(401).json({ message: "Invalid or inactive user." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
