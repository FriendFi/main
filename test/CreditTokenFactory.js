const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CreditTokenFactory", function () {
  let creditTokenFactory;
  let owner;
  let addr1;
  let addr2;
  let mockGameScoreOracle;

  beforeEach(async function () {
    const MockGameScoreOracle = await ethers.getContractFactory(
      "MockGameScoreOracle"
    );
    mockGameScoreOracle = await MockGameScoreOracle.deploy();
    await mockGameScoreOracle.waitForDeployment();

    const CreditTokenFactory = await ethers.getContractFactory(
      "CreditTokenFactory"
    );
    [owner, addr1, addr2] = await ethers.getSigners();
    creditTokenFactory = await CreditTokenFactory.deploy(
      await mockGameScoreOracle.getAddress()
    );
    await creditTokenFactory.waitForDeployment();
  });

  it("Should allow a user to create a credit token", async function () {
    await mockGameScoreOracle.setCreditScore(addr1.address, 100);
    await creditTokenFactory.connect(addr1).createCreditToken("User1Token", "U1T");
    const creditTokenAddress = await creditTokenFactory.getCreditToken(
      addr1.address
    );
    expect(creditTokenAddress).to.not.equal(ethers.ZeroAddress);

    const CreditToken = await ethers.getContractFactory("CreditToken");
    const creditToken = CreditToken.attach(creditTokenAddress);
    expect(await creditToken.name()).to.equal("User1Token");
    expect(await creditToken.symbol()).to.equal("U1T");
  });

  it("Should not allow a user to create multiple credit tokens", async function () {
    await mockGameScoreOracle.setCreditScore(addr1.address, 100);
    await creditTokenFactory.connect(addr1).createCreditToken("User1Token", "U1T");
    await expect(
      creditTokenFactory.connect(addr1).createCreditToken("User1Token2", "U1T2")
    ).to.be.revertedWith("Credit token already exists for this user");
  });

  it("Should not allow creating a credit token with a zero credit score", async function () {
    await expect(
      creditTokenFactory.connect(addr1).createCreditToken("User1Token", "U1T")
    ).to.be.revertedWith("Credit score must be greater than zero");
  });
});
