const hre = require("hardhat");

async function main() {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS; // Set in .env
  const creditTokenAddress = process.env.CREDIT_TOKEN_ADDRESS; // Set in .env after creating a credit token
  const principal = hre.ethers.parseUnits("10", 18); // Example: 10 FRIEND
  const interestRate = 500; // Example: 5% (500 basis points)
  const duration = 86400; // Example: 1 day (in seconds)

  const [signer] = await hre.ethers.getSigners();

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = LendingPool.attach(lendingPoolAddress);

  const friendTokenAddress = await lendingPool.friendToken();
  const FriendToken = await hre.ethers.getContractFactory("FriendToken");
  const friendToken = FriendToken.attach(friendTokenAddress);

  // Approve LendingPool to spend your FRIEND tokens
  const approveTx = await friendToken.connect(signer).approve(lendingPoolAddress, principal);
  await approveTx.wait();

  // Approve LendingPool to spend your CreditTokens
  const CreditToken = await hre.ethers.getContractFactory("CreditToken");
  const creditToken = CreditToken.attach(creditTokenAddress);
  const collateral = principal * 2n; // Replace with a proper collateral calculation
  const approveTx2 = await creditToken.connect(signer).approve(lendingPoolAddress, collateral);
  await approveTx2.wait();
  
  const tx = await lendingPool
    .connect(signer)
    .createLoan(creditTokenAddress, principal, interestRate, duration);
  const receipt = await tx.wait();

  // Get the loanId from the event
  const loanCreatedEvent = receipt.logs.find(
    (log) => log.fragment.name === "LoanCreated"
  );

  const loanId = loanCreatedEvent.args[0];
  console.log(`Loan created with ID: ${loanId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
