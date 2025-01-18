const hre = require("hardhat");

async function main() {
  const lendingPoolAddress = process.env.LENDING_POOL_ADDRESS; // Set in .env
  const loanId = 1; // Set this to the ID of the loan you want to repay

  const [signer] = await hre.ethers.getSigners();

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = LendingPool.attach(lendingPoolAddress);

  const loan = await lendingPool.loans(loanId);
  const interest = (loan.principal * loan.interestRate) / 10000n;
  const totalRepayment = loan.principal + interest;
  
  const friendTokenAddress = await lendingPool.friendToken();
  const FriendToken = await hre.ethers.getContractFactory("FriendToken");
  const friendToken = FriendToken.attach(friendTokenAddress);

  // Approve LendingPool to spend your FRIEND tokens
  const approveTx = await friendToken.connect(signer).approve(lendingPoolAddress, totalRepayment);
  await approveTx.wait();

  const tx = await lendingPool.connect(signer).repayLoan(loanId);
  await tx.wait();

  console.log(`Loan ${loanId} repaid`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
