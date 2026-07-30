const express = require("express");
const isAuth = require("../middlewares/isAuth");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
} = require("../controllers/payment.controller");

const paymentRouter = express.Router();

paymentRouter.post("/create-order", isAuth, createPaymentOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);
paymentRouter.get("/history", isAuth, getPaymentHistory);

module.exports = paymentRouter;
