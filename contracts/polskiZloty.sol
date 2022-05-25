pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract polskiZloty is ERC20{
    constructor(uint256 initialSupply) ERC20("PolskiZloty", "PLN") {
        _mint(0xcAeE9C963bB6AAF46a3aD7eF4E9C24bf0C100B2f, initialSupply);
    }
}