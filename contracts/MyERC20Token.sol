// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20Token is ERC20 {
    uint8 public _decimals;
    uint256 public _totalSupply;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() ERC20("MyERC20Token", "MTK") {
        _decimals = 18;
        _totalSupply = 20_000_000 * 10**_decimals; 
        _mint(address(this), _totalSupply);
        owner = msg.sender;
    }
    
    function transferOut(address recipient, uint256 amount) external onlyOwner {
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance >= amount, "Not enough balance");
        _transfer(address(this), recipient, amount);
    }

    function mint(uint256 amount) external onlyOwner {
        _mint(msg.sender, amount);
    }
}
