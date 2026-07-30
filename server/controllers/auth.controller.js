const User = require("../models/user.model");
const genToken = require("../utils/token");
const getCookieOptions = require("../utils/cookieOptions");

const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name: name || email.split("@")[0], email });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Google auth error ${error.message}` });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", getCookieOptions());
    return res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error.message}` });
  }
};

module.exports = { googleAuth, logout };
