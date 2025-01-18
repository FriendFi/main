// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CreditToken is ERC20, Ownable {
    address public minter;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10 ** 18;

    modifier onlyMinter() {
        require(msg.sender == minter, "Only minter can call this function");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address _minter
    ) ERC20(name, symbol) Ownable(msg.sender) {
        minter = _minter;
    }

    function mint(address to, uint256 amount) public onlyMinter {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Exceeds maximum supply"
        );
        _mint(to, amount);
    }

    function burn(address account, uint256 amount) public onlyMinter {
        _burn(account, amount);
    }

    function setMinter(address newMinter) public onlyOwner {
        minter = newMinter;
    }
}
