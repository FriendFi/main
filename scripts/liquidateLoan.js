const hre = require("hardhat");

async function main() {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS; // Set in .env
  const loanId = 1; // Set this to the ID of the loan you want to liquidate

  const [, liquidator] = await hre.ethers.getSigners(); // Use a different account for liquidation

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = LendingPool.attach(lendingPoolAddress);

  const tx = await lendingPool.connect(liquidator).liquidateLoan(loanId);
  await tx.wait();

  console.log(`Loan ${loanId} liquidated`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
