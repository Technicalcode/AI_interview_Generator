const express = require("express");
const isAuth = require("../middlewares/isAuth")
const { getCurrentUser } = require("../controllers/user.controller")


const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser)

module.exports = userRouter;