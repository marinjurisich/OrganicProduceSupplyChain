const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Organic Produce Supply Chain Contract", function () {

  let contract, ROLE_FARMER, ROLE_AGGREGATOR, ROLE_RETAILER, ADMIN_ROLE;

  before(async function () {
    contract = await ethers.deployContract("OrganicProduceSupplyChain");
    ROLE_FARMER = await contract.ROLE_FARMER();
    ROLE_AGGREGATOR = await contract.ROLE_AGGREGATOR();
    ROLE_RETAILER = await contract.ROLE_RETAILER();
    ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
  });

  it("should make contract deployer an admin", async function () {

    const [deployer] = await ethers.getSigners();
    const isAdmin = await contract.hasRole(ADMIN_ROLE, deployer.address);

    expect(isAdmin).to.equal(true);
  });

  it("should assign roles correctly", async function () {

    let farmerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    let aggregatorAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    let retailerAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

    await contract.grantRole(ROLE_FARMER, farmerAddress);
    await contract.grantRole(ROLE_AGGREGATOR, aggregatorAddress);
    await contract.grantRole(ROLE_RETAILER, retailerAddress);

    const isFarmer = await contract.hasRole(ROLE_FARMER, farmerAddress);
    const isAggregator = await contract.hasRole(ROLE_AGGREGATOR, aggregatorAddress);
    const isRetailer = await contract.hasRole(ROLE_RETAILER, retailerAddress);
    
    expect(isFarmer).to.equal(true);
    expect(isAggregator).to.equal(true);
    expect(isRetailer).to.equal(true);
  });

  it("should increment produceCount on createProduce()", async function () {

    const [deployer] = await ethers.getSigners();

    await contract.grantRole(ROLE_FARMER, deployer.address);
    await contract.createProduce("Apples", 100);

    let produceCount = await contract.produceCount();
    let allProduce = await contract.getAllProduce();
    let length = allProduce.length;

    expect(produceCount).to.equal(1);
    expect(produceCount).to.equal(length);
  });

  it("should emit ProduceCreated event on createProduce()", async function () {

    const [deployer] = await ethers.getSigners();

    await contract.grantRole(ROLE_FARMER, deployer.address);

    await expect(contract.createProduce("Apples", 100)).to.emit(contract, "ProduceCreated");
  });

  it("should emit ProduceTransferred event on produce transfer", async function () {

    const [deployer] = await ethers.getSigners();

    await contract.grantRole(ROLE_FARMER, deployer.address);

    await expect(contract.transferProduceToAggregator(0, ethers.ZeroAddress)).to.emit(contract, "ProduceTransferred");
  });

  it("should emit ProduceSoldToCustomer event on soldToCustomer()", async function () {

    const [deployer] = await ethers.getSigners();

    await contract.grantRole(ROLE_FARMER, deployer.address);
    await contract.grantRole(ROLE_AGGREGATOR, deployer.address);
    await contract.grantRole(ROLE_RETAILER, deployer.address);

    await contract.createProduce("Apples", 100)
    await contract.transferProduceToAggregator(1, deployer.address);
    await contract.transferProduceToRetailer(1, deployer.address);


    await expect(contract.soldToCustomer(1)).to.emit(contract, "ProduceSoldToCustomer");
  });

  it("admin should be able to grand and revoke roles", async function () {

    const contract = await ethers.deployContract("OrganicProduceSupplyChain");
    
    const ROLE_FARMER = await contract.ROLE_FARMER();
    await contract.grantRole(ROLE_FARMER, ethers.ZeroAddress);

    let isFarmer = await contract.hasRole(ROLE_FARMER, ethers.ZeroAddress);
    expect(isFarmer).to.be.true;

    await contract.revokeRole(ROLE_FARMER, ethers.ZeroAddress);
    isFarmer = await contract.hasRole(ROLE_FARMER, ethers.ZeroAddress);
    expect(isFarmer).to.be.false;
  });

});