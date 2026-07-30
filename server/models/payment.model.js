const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    default: ""
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  credits: {
    type: Number,
    required: true
  },
  plan: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);
