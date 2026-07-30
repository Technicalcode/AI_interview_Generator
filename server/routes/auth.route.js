const express = require("express");
const { googleAuth, logout } = require('../controllers/auth.controller'); // ✅ 'logOut' → 'logout'
const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.get("/logout", logout);

module.exports = authRouter;