// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IGameScoreOracle.sol";

contract MockGameScoreOracle is IGameScoreOracle {
    mapping(address => uint256) public creditScores;

    function setCreditScore(address user, uint256 score) public {
        creditScores[user] = score;
    }

    function getCreditScore(address user) public view override returns (uint256) {
        return creditScores[user];
    }
}
