pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract polskiZloty is ERC20{
    constructor(uint256 initialSupply,address account) ERC20("PolskiZloty", "PLN") {
        _mint(account, initialSupply);
    }
}