// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoyaltyToken is ERC20, Ownable {
    constructor() ERC20("LoyaltyToken", "LTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function issueTokens(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function redeemTokens(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
