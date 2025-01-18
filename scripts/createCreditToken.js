const hre = require("hardhat");

async function main() {
  const creditTokenFactoryAddress = process.env.CREDIT_TOKEN_FACTORY_ADDRESS; // Set this in your .env
  const [signer] = await hre.ethers.getSigners();

  const CreditTokenFactory = await hre.ethers.getContractFactory(
    "CreditTokenFactory"
  );
  const creditTokenFactory = CreditTokenFactory.attach(creditTokenFactoryAddress);

  const tx = await creditTokenFactory.connect(signer).createCreditToken("User Credit Token", "UCT");
  await tx.wait();

  const creditTokenAddress = await creditTokenFactory.getCreditToken(signer.address);

  console.log(`Credit token created for ${signer.address} at ${creditTokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
