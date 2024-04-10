var express = require("express");
const Order = require("../model/order.model");
var router = express.Router();
var session = require("express-session");
var format = require("date-format");
const TelegramBot = require("node-telegram-bot-api");
const token = "6713553522:AAHJgs5MnHy5J-J14XSrCorlAJckTFjTR48";
const axios = require("axios").default;
const _ = require("lodash");
const bot = new TelegramBot(token, { polling: true });
bot.onText(/\/start/, (msg, match) => {
  var text = "hi user welcome to bot";
  bot.sendMessage(msg.chat.id, text, { reply_to_message_id: msg.message_id });
}),
  /* GET home page. */
  router.get("/", function (req, res, next) {
    res.render("index", { title: "Phương Mint Store" });
  });

router.post("/", async (req, res, next) => {
  try {
    req.session.phone = req.body.phone;
    const {
      fullName,

      phone,
    } = req.body;

    const codes = req.body["code[]"];
    const quantity = req.body["quantity[]"];
    const sizes = req.body["size[]"];

    // xử lý thêm là find nó ra thì
    let dataObject = [];
    const result = [];
    const orderExist = await Order.findOne({
      phone,
      isActive: "DATAODON",
    }).lean();
    const ChatId = -4147210918;
    if (orderExist) {
      if (codes && !Array.isArray(codes)) {
        dataObject.push({
          code: codes,
          quantity,
          size: sizes,
        });
        orderExist.orderData.push(...dataObject);
        await Order.findOneAndUpdate(
          { phone: orderExist.phone, isActive: "DATAODON" },
          orderExist,
          {
            new: true,
            upsert: true,
          }
        );
        bot.sendMessage(
          ChatId,
          `Chúc mừng bạn có 1 đơn hàng mới từ khách hàng: ${fullName} có số điện thoại là: ${phone} - mã đơn hàng: ${codes}-${sizes}-${quantity}
      `
        );
        res.render("order-success");
      } else {
        codes.forEach((code, index) => {
          dataObject.push({
            code: codes[index],
            size: sizes[index],
            quantity: quantity[index],
          });
        });
        codes.forEach((code, index) => {
          const quan = quantity[index];
          const size = sizes[index];
          const entry = `${code}-${quan}-${size}`;
          result.push(entry);
        });
        orderExist.orderData.push(...dataObject);
        // console.log("dinh chương", dataObject.join(","));
        bot.sendMessage(
          ChatId,
          `Chúc mừng bạn có 1 đơn hàng mới từ khách hàng: ${fullName} có số điện thoại là: ${phone} - mã đơn hàng: ${result.join(
            ","
          )}
      `
        );
        await Order.findOneAndUpdate(
          { phone: orderExist.phone, isActive: "DATAODON" },
          orderExist,
          {
            new: true,
            upsert: true,
          }
        );
        res.render("order-success");
      }
    } else {
      let orderData = [];
      if (codes && !Array.isArray(codes)) {
        orderData.push({
          code: codes,
          quantity,
          size: sizes,
        });
      } else {
        codes.forEach((code, index) => {
          orderData.push({
            code: codes[index],
            size: sizes[index],
            quantity: quantity[index],
          });
        });
      }

      if (codes && !Array.isArray(codes)) {
        bot.sendMessage(
          ChatId,
          `Chúc mừng bạn có 1 đơn hàng mới từ khách hàng: ${fullName} có số điện thoại là: ${phone} - mã đơn hàng: ${codes}-${sizes}-${quantity}
      `
        );
      } else {
        codes.forEach((code, index) => {
          const quan = quantity[index];
          const size = sizes[index];
          const entry = `${code}-${quan}-${size}`;
          result.push(entry);
        });
        bot.sendMessage(
          ChatId,
          `Chúc mừng bạn có 1 đơn hàng mới từ khách hàng: ${fullName} có số điện thoại là: ${phone} - mã đơn hàng: ${result.join(
            ","
          )}
      `
        );
      }
      const order = new Order({ ...req.body, orderData });
      await order.save();
      res.render("order-success");
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/donhang", async (req, res, next) => {
  try {
    let { phoneNumber } = req.query;
    if (phoneNumber) {
      req.session.phone = phoneNumber;
      const orderList = await Order.find({
        phone: phoneNumber,
      })
        .sort({ createdAt: -1 })
        .lean();

      const mapData = orderList.map((item) => {
        return {
          ...item,
          orderData: item.orderData
            .map((item2) => `${item2.code}-${item2.size}-${item2.quantity}`)
            .join(","),
          total: item.orderData.reduce((a, b) => a + b.quantity, 0),
          createdAt: format("dd-MM-yy hh:mm", item.createdAt),
        };
      });
      res.render("donhang.ejs", {
        title: "Quản lý đơn hàng",
        data: mapData || [],
      });
    } else {
      const orderList = await Order.find({
        phone: req.session.phone,
      })
        .sort({ createdAt: -1 })
        .lean();

      const mapData = orderList.map((item) => {
        return {
          ...item,
          orderData: item.orderData
            .map((item2) => `${item2.code}-${item2.size}-${item2.quantity}`)
            .join(","),
          total: item.orderData.reduce((a, b) => a + b.quantity, 0),
          createdAt: format("dd-MM-yy hh:mm", item.createdAt),
        };
      });
      res.render("donhang.ejs", {
        title: "Quản lý đơn hàng",
        data: mapData || [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// ghet User By Phone

router.post("/get-user-by-phone", async (req, res, next) => {
  const { phone } = req.body;
  const user = await Order.findOne({ phone }).lean();
  if (phone.length === 10 && user != null) {
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json"
    );
    const city = _.get(
      _.find(data, (item) => item.Id === user.city),
      "Name",
      ""
    );
    const district = _.get(
      _.find(
        _.get(
          _.find(data, (item) => item.Id === user.city),
          "Districts",
          []
        ),
        (item) => item.Id === user.district
      ),
      "Name",
      ""
    );
    const ward = _.get(
      _.find(
        _.get(
          _.find(
            _.get(
              _.find(data, (item) => item.Id === user.city),
              "Districts",
              []
            ),
            (item) => item.Id === user.district
          ),
          "Wards",
          []
        ),
        (item) => item.Id === user.ward
      ),
      "Name",
      ""
    );
    user.cityName = city;
    user.districtName = district;
    user.wardName = ward;

    return res.status(200).json(user);
  }

  return res.status(200).json(user);
});

module.exports = router;
