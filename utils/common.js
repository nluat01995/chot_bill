const _ = require("lodash");
const productItem = require("../model/ProductItemPrice.model");
const Order = require("../model/order.model");
const { getProvinceName, getDistrictName, getWardName } = require("./province");
const axios = require("axios").default;

module.exports = {
  dataProccess: async () => {
    // find điều kien đã tạo đơn, nếu đã hủy k tạo

    const orderList = await Order.find({
      isActive: { $eq: "DATAODON" },
    }).lean();
    console.log("check------------1", orderList);
    for (const order of orderList) {
      const orderData = order.orderData;
      // Duyệt qua từng sản phẩm trong orderData
      for (const item of orderData) {
        const productCode = item.code; // Lấy mã sản phẩm từ orderData

        // Tìm sản phẩm trong ProductItem dựa trên mã sản phẩm
        const product = await productItem.findOne({ productCode });

        if (product) {
          // Nếu tìm thấy sản phẩm, cập nhật thông tin vào orderData
          item.price = product.price;
          item.name = product.productName;
          item.weight = product.weight;
          item.length = product.length;
          item.height = product.height;
          item.width = product.width;
        }
      }
      await Order.findOneAndUpdate(
        { phone: order.phone, isActive: "DATAODON" },
        order,
        {
          upsert: true,
          new: true,
        }
      );
    }
    let orderListData = await Order.find({
      isActive: { $eq: "DATAODON" },
    }).lean();

    let orderItems = [];
    for (let i = 0; i < orderListData.length; i++) {
      const cityName = await getProvinceName(orderListData[i].city);
      const districtName = await getDistrictName(
        orderListData[i].city,
        orderListData[i].district
      );
      const wardName = await getWardName(
        orderListData[i].city,
        orderListData[i].district,
        orderListData[i].ward
      );
      orderItems.push({
        ...orderListData[i],
        cod_amount: orderListData[i].orderData.reduce((a, b) => a + b.price, 0),
        soLuong: orderListData[i].orderData.reduce((a, b) => a + b.quantity, 0),
        totalWeight: orderListData[i].orderData.reduce(
          (a, b) => a + b.weight,
          0
        ),
        cityName: cityName ?? "",
        districtName: districtName ?? "",
        wardName: wardName ?? "",
      });
    }

    return orderItems;
  },

  apiGHN: async (data) => {
    try {
      console.log("data", data);
      const data2 = await axios.post(process.env.URL_GHN, data, {
        headers: {
          "Content-Type": "application/json",
          ShopId: 5002032,
          Token: "db514efe-f6f9-11ee-aebc-56bc015a6b03",
        },
      });
      const status = _.get(data2, "status", null);
      if (status === 200) {
        await Order.findOneAndUpdate(
          { phone: data.to_phone, isActive: "DATAODON" },
          {
            orderCode: _.get(data2, "data.data.order_code", 0),
            isActive: "DAGIAOCHOSHIPPER",
          }
        );
        return data2;
      }
    } catch (error) {
      await Order.findOneAndUpdate(
        { phone: data.to_phone },
        {
          isActive: "TRANSFER_FAILED",
          isFailed: false,
        }
      );
      console.log(error);
    }
  },
};
