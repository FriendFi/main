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

  // Deploy CreditTokenFactory
  console.log("Deploying CreditTokenFactory...");
  const CreditTokenFactory = await hre.ethers.getContractFactory(
    "CreditTokenFactory"
  );
  const creditTokenFactory = await CreditTokenFactory.deploy();
  await creditTokenFactory.waitForDeployment();
  const creditTokenFactoryAddress = await creditTokenFactory.getAddress();
  console.log("CreditTokenFactory deployed to:", creditTokenFactoryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
