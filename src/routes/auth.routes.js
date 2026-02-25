const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

//api/auth/user/...
router.post("/user/register", authController.register);
router.post("/user/login", authController.login);
router.post("/user/logout", authController.logout);
module.exports = router;
