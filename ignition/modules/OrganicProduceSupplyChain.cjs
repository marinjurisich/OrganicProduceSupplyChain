const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");


module.exports = buildModule("Produce_V4", (m) => {

  const produce = m.contract("OrganicProduceSupplyChain", []);

  const ROLE_FARMER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_FARMER"));
  
  m.call(produce, "grantRole", ["ROLE_FARMER", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8]);

  return { produce };
});