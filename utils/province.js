const _ = require("lodash");
const productItem = require("../model/ProductItemPrice.model");
const Order = require("../model/order.model");
const axios = require("axios").default;
module.exports = {
  getProvinceName: async (cityId) => {
    const provinces = _.get(await axios.get(process.env.API_VUNG), "data", []);
    const province = provinces.find((p) => p.Id === cityId);
    return province ? province.Name : "Unknown";
  },
  getDistrictName: async (cityId, districtId) => {
    const provinces = _.get(await axios.get(process.env.API_VUNG), "data", []);
    const province = provinces.find((p) => p.Id === cityId);
    if (province) {
      const district = province.Districts.find((d) => d.Id === districtId);
      return district ? district.Name : "Unknown";
    }
    return "Unknown";
  },
  getWardName: async (cityId, districtId, wardId) => {
    const provinces = _.get(await axios.get(process.env.API_VUNG), "data", []);
    const province = provinces.find((p) => p.Id === cityId);
    if (province) {
      const district = province.Districts.find((d) => d.Id === districtId);
      if (district) {
        const ward = district.Wards.find((w) => w.Id === wardId);
        return ward ? ward.Name : "Unknown";
      }
    }
    return "Unknown";
  },
};
