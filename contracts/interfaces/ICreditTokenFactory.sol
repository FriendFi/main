// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ICreditTokenFactory {
    event CreditTokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed owner
    );

    function createCreditToken(
        string memory name,
        string memory symbol
    ) external;

    function getCreditToken(address user) external view returns (address);
}
