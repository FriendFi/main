let provider;
let signer;
let friendTokenContract;
let creditTokenFactoryContract;
let lendingPoolContract;
let connected = false;

const friendTokenAddress = "DEPLOYED_FRIEND_TOKEN_ADDRESS"; // Replace after deployment
const creditTokenFactoryAddress = "DEPLOYED_CREDIT_TOKEN_FACTORY_ADDRESS"; // Replace after deployment
const lendingPoolAddress = "DEPLOYED_LENDING_POOL_ADDRESS"; // Replace after deployment
const mockGameScoreOracleAddress = "DEPLOYED_MOCK_GAME_SCORE_ORACLE_ADDRESS"; //Replace after deployment

const friendTokenAbi = [
    // Paste the ABI of FriendToken here
];
const creditTokenFactoryAbi = [
    // Paste the ABI of CreditTokenFactory here
];
const lendingPoolAbi = [
    // Paste the ABI of LendingPool here
];

const mockGameScoreOracleAbi = [
  // Paste the ABI of MockGameScoreOracle here
];

const connectButton = document.getElementById("connectButton");
const setScoreButton = document.getElementById("setScoreButton");
const scoreInput = document.getElementById("scoreInput");
const createTokenButton = document.getElementById("createTokenButton");
const tokenNameInput = document.getElementById("tokenName");
const tokenSymbolInput = document.getElementById("tokenSymbol");
const creditTokenAddressDisplay = document.getElementById("creditTokenAddress");
const createLoanButton = document.getElementById("createLoanButton");
const loanPrincipalInput = document.getElementById("loanPrincipal");
const loanInterestInput = document.getElementById("loanInterest");
const loanDurationInput = document.getElementById("loanDuration");
const loanIdDisplay = document.getElementById("loanId");
const repayLoanButton = document.getElementById("repayLoanButton");
const repayLoanIdInput = document.getElementById("repayLoanId");
const liquidateLoanButton = document.getElementById("liquidateLoanButton");
const liquidateLoanIdInput = document.getElementById("liquidateLoanId");

connectButton.onclick = async () => {
  if (!connected) {
    await connectWallet();
  } else {
    await disconnectWallet();
  }
};

setScoreButton.onclick = async () => {
  const score = scoreInput.value;
  const scoreOracle = new ethers.Contract(mockGameScoreOracleAddress, mockGameScoreOracleAbi, signer);
  const tx = await scoreOracle.setCreditScore(signer.getAddress(), score);
  await tx.wait();
  alert(`Credit score set to ${score}`);
};

createTokenButton.onclick = async () => {
  const name = tokenNameInput.value;
  const symbol = tokenSymbolInput.value;

  const tx = await creditTokenFactoryContract.createCreditToken(name, symbol);
  await tx.wait();

  const creditTokenAddress = await creditTokenFactoryContract.getCreditToken(
    signer.getAddress()
  );
  creditTokenAddressDisplay.textContent = `Credit Token Address: ${creditTokenAddress}`;
  document.getElementById("creditTokenAddress").value = creditTokenAddress;
};

createLoanButton.onclick = async () => {
  const principal = ethers.utils.parseUnits(loanPrincipalInput.value, 18);
  const interestRate = loanInterestInput.value;
  const duration = loanDurationInput.value;
  const creditTokenAddress = document.getElementById("creditTokenAddress").value;

  // Approve spending of FRIEND tokens
  const approveTx = await friendTokenContract.approve(lendingPoolAddress, principal);
  await approveTx.wait();

  // Calculate collateral (replace with actual calculation)
  const collateral = principal * 2n;

  // Get CreditToken contract instance
  const creditTokenAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    // Add other necessary ABI elements if needed
  ];
  const creditTokenContract = new ethers.Contract(creditTokenAddress, creditTokenAbi, signer);

  // Approve spending of CreditTokens
  const approveTx2 = await creditTokenContract.approve(lendingPoolAddress, collateral);
  await approveTx2.wait();

  const tx = await lendingPoolContract.createLoan(
    creditTokenAddress,
    principal,
    interestRate,
    duration
  );
  const receipt = await tx.wait();

  // Extract loan ID from event (replace with actual event name and structure if different)
  const loanCreatedEvent = receipt.events?.find((e) => e.event === "LoanCreated");
  if (loanCreatedEvent) {
    const loanId = loanCreatedEvent.args.loanId;
    loanIdDisplay.textContent = `Loan ID: ${loanId}`;
  } else {
    loanIdDisplay.textContent = "Loan ID not found in transaction receipt";
  }
};


repayLoanButton.onclick = async () => {
  const loanId = repayLoanIdInput.value;

  // Get the loan details to calculate repayment amount
  const loan = await lendingPoolContract.loans(loanId);
  const interest = (loan.principal * loan.interestRate) / 10000n;
  const totalRepayment = loan.principal + interest;

  // Approve spending of FRIEND tokens for repayment
  const approveTx = await friendTokenContract.approve(lendingPoolAddress, totalRepayment);
  await approveTx.wait();

  // Repay the loan
  const tx = await lendingPoolContract.repayLoan(loanId);
  await tx.wait();

  alert(`Loan ${loanId} repaid!`);
};

liquidateLoanButton.onclick = async () => {
  const loanId = liquidateLoanIdInput.value;
  const tx = await lendingPoolContract.liquidateLoan(loanId);
  await tx.wait();
  alert(`Loan ${loanId} liquidated`);
};

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      await provider.send("eth_requestAccounts", []);

      signer = provider.getSigner();
      friendTokenContract = new ethers.Contract(
        friendTokenAddress,
        friendTokenAbi,
        signer
      );
      creditTokenFactoryContract = new ethers.Contract(
        creditTokenFactoryAddress,
        creditTokenFactoryAbi,
        signer
      );
      lendingPoolContract = new ethers.Contract(
        lendingPoolAddress,
        lendingPoolAbi,
        signer
      );
      connected = true;
      connectButton.textContent = "Disconnect Wallet";
      console.log("Wallet connected");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      connected = false;
      connectButton.textContent = "Connect Wallet";
    }
  } else {
    console.error("Please install MetaMask or another compatible wallet");
  }
}

async function disconnectWallet() {
  // Since there's no standard way to disconnect, we'll just reset the state
  provider = null;
  signer = null;
  friendTokenContract = null;
  creditTokenFactoryContract = null;
  lendingPoolContract = null;
  connected = false;
  connectButton.textContent = "Connect Wallet";
  console.log("Wallet disconnected");
}
