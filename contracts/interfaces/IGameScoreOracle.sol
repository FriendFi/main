// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IGameScoreOracle {
    function getCreditScore(address user) external view returns (uint256);
}
