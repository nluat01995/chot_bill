const mongoose = require("mongoose");

const productItemPriceSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
    },
    productCode: {
      type: String,
    },
    price: {
      type: Number,
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
  {
    timestamps: true,
  }
);
const productItem = mongoose.model("ProductPrice", productItemPriceSchema);
module.exports = productItem;
