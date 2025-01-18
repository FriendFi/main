const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingPool", function () {
  let friendToken;
  let creditTokenFactory;
  let lendingPool;
  let owner;
  let addr1;
  let addr2;
  let creditToken;
  let mockGameScoreOracle;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FriendToken = await ethers.getContractFactory("FriendToken");
    friendToken = await FriendToken.deploy();
    await friendToken.waitForDeployment();

    const MockGameScoreOracle = await ethers.getContractFactory(
      "MockGameScoreOracle"
    );
    mockGameScoreOracle = await MockGameScoreOracle.deploy();
    await mockGameScoreOracle.waitForDeployment();

    const CreditTokenFactory = await ethers.getContractFactory(
      "CreditTokenFactory"
    );
    creditTokenFactory = await CreditTokenFactory.deploy(
      await mockGameScoreOracle.getAddress()
    );
    await creditTokenFactory.waitForDeployment();

    const LendingPool = await ethers.getContractFactory("LendingPool");
    lendingPool = await LendingPool.deploy(
      await friendToken.getAddress(),
      await creditTokenFactory.getAddress()
    );
    await lendingPool.waitForDeployment();

    // Create a credit token for addr1
    await mockGameScoreOracle.setCreditScore(addr1.address, 100);
    await creditTokenFactory.connect(addr1).createCreditToken("User1Token", "U1T");
    const creditTokenAddress = await creditTokenFactory.getCreditToken(
      addr1.address
    );
    const CreditToken = await ethers.getContractFactory("CreditToken");
    creditToken = CreditToken.attach(creditTokenAddress);

    // Mint some FRIEND tokens for testing
    await friendToken.mint(owner.address, ethers.parseUnits("1000", 18));
    await friendToken.mint(addr1.address, ethers.parseUnits("1000", 18));
    await friendToken.mint(addr2.address, ethers.parseUnits("1000", 18));
  });

  it("Should allow creating a loan", async function () {
    const principal = ethers.parseUnits("100", 18);
    const interestRate = 500; // 5%
    const duration = 86400; // 1 day
    const collateral = principal * 2n;
    
    // Approve before creating a loan
    await friendToken.connect(addr1).approve(await lendingPool.getAddress(), principal);
    await creditToken.connect(addr1).approve(await lendingPool.getAddress(), collateral);

    await expect(
      lendingPool
        .connect(addr1)
        .createLoan(creditToken.target, principal, interestRate, duration)
    )
      .to.emit(lendingPool, "LoanCreated")
      .withArgs(1, addr1.address, creditToken.target, principal, collateral, interestRate);

    const loan = await lendingPool.loans(1);
    expect(loan.borrower).to.equal(addr1.address);
    expect(loan.creditToken).to.equal(creditToken.target);
    expect(loan.principal).to.equal(principal);
    expect(loan.collateral).to.equal(collateral);
    expect(loan.interestRate).to.equal(interestRate);
    expect(loan.duration).to.equal(duration);
    expect(loan.startTime).to.not.equal(0);
    expect(loan.repaid).to.equal(false);
  });

  it("Should allow repaying a loan", async function () {
    const principal = ethers.parseUnits("100", 18);
    const interestRate = 500; // 5%
    const duration = 86400; // 1 day
    const collateral = principal * 2n;

    // Approve before creating a loan
    await friendToken.connect(addr1).approve(await lendingPool.getAddress(), principal);
    await creditToken.connect(addr1).approve(await lendingPool.getAddress(), collateral);
    
    await lendingPool
      .connect(addr1)
      .createLoan(creditToken.target, principal, interestRate, duration);

    // Repay the loan
    const interest = (principal * BigInt(interestRate)) / 10000n;
    const totalRepayment = principal + interest;
    await friendToken.connect(addr1).approve(await lendingPool.getAddress(), totalRepayment);

    await expect(lendingPool.connect(addr1).repayLoan(1))
      .to.emit(lendingPool, "LoanRepaid")
      .withArgs(1, addr1.address);

    const loan = await lendingPool.loans(1);
    expect(loan.repaid).to.equal(true);
  });

  it("Should allow liquidating a loan", async function () {
    const principal = ethers.parseUnits("100", 18);
    const interestRate = 500; // 5%
    const duration = 86400; // 1 day
    const collateral = principal * 2n;

    // Approve before creating a loan
    await friendToken.connect(addr1).approve(await lendingPool.getAddress(), principal);
    await creditToken.connect(addr1).approve(await lendingPool.getAddress(), collateral);

    await lendingPool
      .connect(addr1)
      .createLoan(creditToken.target, principal, interestRate, duration);

    // Increase time to after the loan duration
    await ethers.provider.send("evm_increaseTime", [duration + 1]);
    await ethers.provider.send("evm_mine");

    // Liquidate the loan
    await expect(lendingPool.connect(addr2).liquidateLoan(1))
      .to.emit(lendingPool, "LoanLiquidated")
      .withArgs(1, addr2.address);

    const loan = await lendingPool.loans(1);
    expect(loan.repaid).to.equal(true);
  });
});
