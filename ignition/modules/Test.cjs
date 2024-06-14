const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Test_V1", (m) => {

  const test = m.contract("Test", []);
  m.call(test, "increment", []);

  return { test };
});