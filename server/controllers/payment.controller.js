const crypto = require("crypto");
const axios = require("axios");
const Payment = require("../models/payment.model");
const User = require("../models/user.model");

const plans = {
  practice: {
    name: "Practice",
    credits: 50,
    amount: 4900
  },
  pro: {
    name: "Pro",
    credits: 200,
    amount: 14900
  }
};

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are not configured");
  }

  return { keyId, keySecret };
};

const timingSafeEqualHex = (left, right) => {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const createPaymentOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid credit plan" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { keyId, keySecret } = getRazorpayConfig();
    const receipt = `credits_${Date.now()}_${user._id.toString().slice(-6)}`;

    const orderResponse = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: selectedPlan.amount,
        currency: "INR",
        receipt,
        notes: {
          userId: user._id.toString(),
          plan,
          credits: String(selectedPlan.credits)
        }
      },
      {
        auth: {
          username: keyId,
          password: keySecret
        }
      }
    );

    const payment = await Payment.create({
      user: user._id,
      orderId: orderResponse.data.id,
      amount: selectedPlan.amount,
      currency: orderResponse.data.currency || "INR",
      credits: selectedPlan.credits,
      plan
    });

    return res.status(201).json({
      keyId,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      credits: payment.credits,
      plan: selectedPlan.name,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data?.error?.description || error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification data is missing" });
    }

    const { keySecret } = getRazorpayConfig();
    const payment = await Payment.findOne({ orderId: razorpay_order_id, user: req.userId });

    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${payment.orderId}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = timingSafeEqualHex(expectedSignature, razorpay_signature);

    if (!isValid) {
      payment.status = "failed";
      payment.paymentId = razorpay_payment_id;
      await payment.save();
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (payment.status !== "paid") {
      payment.status = "paid";
      payment.paymentId = razorpay_payment_id;
      user.credits += payment.credits;
      await Promise.all([payment.save(), user.save()]);
    }

    return res.status(200).json({
      message: "Payment verified and credits added",
      user,
      payment
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory
};
