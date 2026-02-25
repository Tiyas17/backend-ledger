const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model");

async function register(req, res) {
  const { name, email, password } = req.body;
  const isUserExist = await userModel.findOne({
    email: email,
  });

  if (isUserExist) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token);
  res.status(201).json({
    message: "User Registered Successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });

  await emailService.sendRegistrationEmail(user.email, user.name);
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await userModel
    .findOne({
      email: email,
    })
    .select("+password");

  if (!user) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({
      message: "Invalid Credentials",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id,
    },
    process.env.JWT_SECRET,
  );
  res.cookie("token", token);
  res.status(200).json({
    message: "User logged in Successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

async function logout(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully!!",
    });
  }
  await tokenBlackListModel.create({
    token: token,
  });
  res.clearCookie("token");
  return res.status(200).json({
    message: "User logged out successfully",
  });
}

module.exports = {
  register,
  login,
  logout,
};
