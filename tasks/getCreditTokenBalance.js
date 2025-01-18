const { task } = require("hardhat/config");

task("getCreditTokenBalance", "Gets the CreditToken balance of an address")
    .addParam("account", "The account's address")
    .addOptionalParam("creditToken", "The CreditToken address")
    .setAction(async (taskArgs, hre) => {
        const creditTokenFactoryAddress = process.env.CREDIT_TOKEN_FACTORY_ADDRESS;
        const account = taskArgs.account;
        const creditTokenAddress = taskArgs.creditToken;

        const CreditTokenFactory = await hre.ethers.getContractFactory("CreditTokenFactory");
        const creditTokenFactory = CreditTokenFactory.attach(creditTokenFactoryAddress);
        let tokenAddress = creditTokenAddress;

        if (!tokenAddress) {
            tokenAddress = await creditTokenFactory.getCreditToken(account);
        }

        const CreditToken = await hre.ethers.getContractFactory("CreditToken");
        const creditToken = CreditToken.attach(tokenAddress);

        const balance = await creditToken.balanceOf(account);
        const symbol = await creditToken.symbol();
        console.log(
            `${account} has ${hre.ethers.formatUnits(balance, 18)} ${symbol} tokens`
        );
    });
