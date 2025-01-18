// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CreditToken.sol";

contract CreditTokenFactory {
    event CreditTokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        address indexed owner
    );

    mapping(address => address) public userCreditTokens;

    function createCreditToken(
        string memory name,
        string memory symbol
    ) public {
        require(
            userCreditTokens[msg.sender] == address(0),
            "Credit token already exists for this user"
        );

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
}
