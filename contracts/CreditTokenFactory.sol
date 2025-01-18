// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CreditToken.sol";
import "./interfaces/IGameScoreOracle.sol";

contract CreditTokenFactory {
    event CreditTokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed owner
    );

    mapping(address => address) public userCreditTokens;
    IGameScoreOracle public gameScoreOracle;

    constructor(address _gameScoreOracle) {
        gameScoreOracle = IGameScoreOracle(_gameScoreOracle);
    }

    function createCreditToken(
        string memory name,
        string memory symbol
    ) public {
        require(
            userCreditTokens[msg.sender] == address(0),
            "Credit token already exists for this user"
        );

        uint256 creditScore = gameScoreOracle.getCreditScore(msg.sender);
        require(creditScore > 0, "Credit score must be greater than zero");

        CreditToken creditToken = new CreditToken(
            name,
            symbol,
            address(this)
        );
        userCreditTokens[msg.sender] = address(creditToken);

        emit CreditTokenCreated(
            address(creditToken),
            name,
            symbol,
            msg.sender
        );
    }

    function getCreditToken(address user) public view returns (address) {
        return userCreditTokens[user];
    }

    function setGameScoreOracle(address _gameScoreOracle) public {
        gameScoreOracle = IGameScoreOracle(_gameScoreOracle);
    }
}
