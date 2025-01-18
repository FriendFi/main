const { task } = require("hardhat/config");

task("getFriendTokenBalance", "Gets the FriendToken balance of an address")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const friendTokenAddress = process.env.FRIEND_TOKEN_ADDRESS; // Set in .env
    const account = taskArgs.account;

    const FriendToken = await hre.ethers.getContractFactory("FriendToken");
    const friendToken = FriendToken.attach(friendTokenAddress);

    const balance = await friendToken.balanceOf(account);

    console.log(
      `${account} has ${hre.ethers.formatUnits(
        balance,
        18
      )} FRIEND tokens`
    );
  });
