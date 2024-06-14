const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Contract", function () {
  it("Deployment should create counter with value 0", async function () {

    const test = await ethers.deployContract("Test");

    expect(await test.counter()).to.equal(0);
  });

  it("increment() should increase counter by one", async function () {

    const test = await ethers.deployContract("Test");
    await test.increment();

    expect(await test.counter()).to.equal(1);
  });

});