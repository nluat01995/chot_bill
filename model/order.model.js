const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    note: {
      type: String,
    },
    city: {
      type: String,
    },
    orderData: [
      {
        name: {
          type: String,
        },
        price: {
          type: Number,
          default: 0,
        },
        code: {
          type: String,
        },
        quantity: {
          type: Number,
        },
        size: {
          type: String,
        },
        weight: {
          type: Number,
        },
        length: {
          type: Number,
        },
        width: {
          type: Number,
        },
        height: {
          type: Number,
        },
      },
    ],
    district: {
      type: String,
    },
    ward: {
      type: String,
    },
    addressDetail: {
      type: String,
    },
    isActive: {
      type: String,
      default: "DATAODON",
    },
    lock: {
      type: Boolean,
      default: true,
    },
    orderCode: {
      type: String,
      default: null,
    },
    isFailed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
