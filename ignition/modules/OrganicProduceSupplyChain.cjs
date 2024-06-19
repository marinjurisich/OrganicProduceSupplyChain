const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");


module.exports = buildModule("Produce_V10", (m) => {

  const produce = m.contract("OrganicProduceSupplyChain", []);

 
  const ROLE_FARMER = ethers.solidityPackedKeccak256(["string"], ["ROLE_FARMER"]);
  const ROLE_AGGREGATOR = ethers.id("ROLE_AGGREGATOR");
  const ROLE_RETAILER = ethers.id("ROLE_RETAILER");
  // const ROLE_AGGREGATOR = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_AGGREGATOR"));
  // const ROLE_RETAILER = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ROLE_RETAILER"));
  
  m.call(produce, "grantRole(bytes32,address,string)", [ROLE_FARMER, "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "Farmer#1"], {
    id: "Produce_grantRole_farmer"
  });
  m.call(produce, "grantRole(bytes32,address,string)", [ROLE_AGGREGATOR, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "Aggregator#1"], {
    id: "Produce_grantRole_aggregator"
  });
  m.call(produce, "grantRole(bytes32,address,string)", [ROLE_RETAILER, "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "Retailer#1"], {
    id: "Produce_grantRole_retailer"
  });

  return { produce };
});