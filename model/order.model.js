const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    code: {
      type: String,
    },
    note: {
      type: String,
    },
    city: {
      type: String,
    },
    district: {
      type: String,
    },
    ward: {
      type: String,
    },
    addressDetail: {
      type: String,
    },
    items: [],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
