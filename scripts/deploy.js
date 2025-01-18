const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FriendToken
  const FriendToken = await hre.ethers.getContractFactory("FriendToken");
  const friendToken = await FriendToken.deploy();
  await friendToken.waitForDeployment();
  const friendTokenAddress = await friendToken.getAddress();
  console.log("FriendToken deployed to:", friendTokenAddress);

  // Deploy MockGameScoreOracle
  const MockGameScoreOracle = await hre.ethers.getContractFactory(
    "MockGameScoreOracle"
  );
  const mockGameScoreOracle = await MockGameScoreOracle.deploy();
  await mockGameScoreOracle.waitForDeployment();
  const mockGameScoreOracleAddress = await mockGameScoreOracle.getAddress();
  console.log("MockGameScoreOracle deployed to:", mockGameScoreOracleAddress);

  // Deploy CreditTokenFactory
  const CreditTokenFactory = await hre.ethers.getContractFactory(
    "CreditTokenFactory"
  );
  const creditTokenFactory = await CreditTokenFactory.deploy(
    mockGameScoreOracleAddress
  );
  await creditTokenFactory.waitForDeployment();
  const creditTokenFactoryAddress = await creditTokenFactory.getAddress();
  console.log("CreditTokenFactory deployed to:", creditTokenFactoryAddress);

  // Deploy LendingPool
  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(
    friendTokenAddress,
    creditTokenFactoryAddress
  );
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();
  console.log("LendingPool deployed to:", lendingPoolAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
