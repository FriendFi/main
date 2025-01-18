const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FriendToken", function () {
  let friendToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const FriendToken = await ethers.getContractFactory("FriendToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    friendToken = await FriendToken.deploy();
    await friendToken.waitForDeployment();
  });

  it("Should have correct name and symbol", async function () {
    expect(await friendToken.name()).to.equal("FriendToken");
    expect(await friendToken.symbol()).to.equal("FRIEND");
  });

  it("Should mint initial supply to owner", async function () {
    const ownerBalance = await friendToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("1000000000", 18));
  });

  it("Should allow owner to mint", async function () {
    const amountToMint = ethers.parseUnits("100", 18);
    await friendToken.mint(addr1.address, amountToMint);
    const addr1Balance = await friendToken.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(amountToMint);
  });

  it("Should allow burning tokens", async function () {
    const amountToBurn = ethers.parseUnits("100", 18);
    await friendToken.burn(amountToBurn);
    const ownerBalance = await friendToken.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("999999900", 18));
  });

  it("Should not allow non-owner to mint", async function () {
    const amountToMint = ethers.parseUnits("100", 18);
    await expect(
      friendToken.connect(addr1).mint(addr2.address, amountToMint)
    ).to.be.revertedWithCustomError(friendToken, "OwnableUnauthorizedAccount");
  });
});
