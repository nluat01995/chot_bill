var express = require("express");
const productItem = require("../model/ProductItemPrice.model");
const Order = require("../model/order.model");
const { dataProccess, apiGHN } = require("../utils/common");
const asyncForEach = require("async-await-foreach");
var router = express.Router();
const _ = require("lodash");
/* GET users listing. */
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
      res.render("admin/donhang", {
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
      res.render("admin/donhang", {
        title: "Quản lý đơn hàng",
        data: mapData || [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
// tạo sản phẩm
router.post("/san-pham", async (req, res, next) => {
  const newProduct = new productItem(req.body);
  await newProduct.save();
  return res.send("Tạo sản phẩm thành công");
});
router.get("/san-pham", async (req, res, next) => {
  const products = await productItem.find({}).lean();
  return res.json(products);
});
router.get("/san-pham/:id", async (req, res, next) => {
  const products = await productItem.findById({ _id }).lean();
  return res.json(products);
});
router.post("/san-pham/:id", async (req, res, next) => {
  const newProduct = await productItem.findByIdAndUpdate({ _id }, req.body);
  return res.send("Cập sản phẩm thành công");
});
router.post("/san-pham/delete/:id", async (req, res, next) => {
  await productItem.findByIdAndDelete({ _id }, req.body);
  return res.send("Xóa sản phẩm thành công");
});
// Quản lý đơn hàng đã tạo

router.get("/don-hang", async (req, res, next) => {
  try {
    // find điều kien đã tạo đơn, nếu đã hủy k tạo
    const orderItems = await dataProccess();
    console.log(orderItems);
    res.render("admin/blank", { items: orderItems || [] });
  } catch (error) {
    console.log(error);
  }
});

router.post("/tao-don-ghn", async (req, res, next) => {
  try {
    const orderItems = await dataProccess();
    console.log(orderItems);
    await asyncForEach(orderItems, async (item) => {
      const check = await apiGHN({
        payment_type_id: 2,
        required_note: "CHOXEMHANGKHONGTHU",
        client_order_code: "",
        to_name: _.get(item, "fullName", ""),
        to_phone: _.get(item, "phone", ""),
        to_address: _.get(item, "addressDetail", ""),
        to_ward_name: _.get(item, "wardName", ""),
        to_district_name: _.get(item, "districtName", ""),
        to_province_name: _.get(item, "cityName", ""),
        cod_amount: _.get(item, "cod_amount", 0),
        weight: _.get(item, "totalWeight", 0),
        length: 32,
        width: 19,
        height: 10,
        cod_failed_amount: 20000,
        pick_station_id: 1444,
        deliver_station_id: null,
        insurance_value: _.get(item, "cod_amount", 0),
        service_id: 0,
        service_type_id: 2,
        items: item.orderData,
      });
    });
    res.send("ok");
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
