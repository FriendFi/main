const fs = require("fs");
const path = require("path");

async function main() {
  const contractName = process.argv[2];
  if (!contractName) {
    console.error("Please provide a contract name");
    process.exit(1);
  }

  const contractArtifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  try {
    const contractArtifact = JSON.parse(
      fs.readFileSync(contractArtifactPath, "utf8")
    );
    const abi = contractArtifact.abi;

    console.log(JSON.stringify(abi, null, 2));
  } catch (error) {
    console.error(`Failed to get ABI for ${contractName}:`, error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
