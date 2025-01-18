const hre = require("hardhat");

async function main() {
  const scoreOracleAddress = process.env.MOCK_GAME_SCORE_ORACLE_ADDRESS; // Set this in your .env
  const userAddress = process.env.USER_ADDRESS; // Set this in your .env
  const score = 100; // Example score

  const MockGameScoreOracle = await hre.ethers.getContractFactory(
    "MockGameScoreOracle"
  );
  const scoreOracle = MockGameScoreOracle.attach(scoreOracleAddress);

  const tx = await scoreOracle.setCreditScore(userAddress, score);
  await tx.wait();

  console.log(`Credit score for ${userAddress} set to ${score}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
