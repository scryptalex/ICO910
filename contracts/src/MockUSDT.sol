// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Simple test USDT with 6 decimals for testnets
contract MockUSDT is ERC20 {
    uint8 private constant _DECIMALS = 6;

    constructor(uint256 initialSupply) ERC20("Tether USD", "USDT") {
        _mint(msg.sender, initialSupply);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
}

