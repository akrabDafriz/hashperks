// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract LoyaltyToken is Context, Ownable {
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;

    event PointsIssued(address indexed customer, uint256 amount);
    event PointsRedeemed(address indexed customer, uint256 amount);

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        address initialOwner
    ) Ownable(initialOwner) {
        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimals;
    }

    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }

    function issuePoints(
        address customer,
        uint256 amount
    ) public virtual onlyOwner {
        require(
            customer != address(0),
            "LoyaltyToken: issue to the zero address"
        );
        require(amount > 0, "LoyaltyToken: issue zero amount");

        _totalSupply += amount;
        _balances[customer] += amount;
        emit PointsIssued(customer, amount);
    }

    function redeemPoints(uint256 amount) public virtual {
        address spender = _msgSender();
        require(
            spender != address(0),
            "LoyaltyToken: redeem from the zero address"
        );
        require(amount > 0, "LoyaltyToken: redeem zero amount");
        require(
            _balances[spender] >= amount,
            "LoyaltyToken: insufficient balance for redemption"
        );

        _balances[spender] -= amount;
        _totalSupply -= amount;
        emit PointsRedeemed(spender, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
    }

    // function transfer(
    //     address recipient,
    //     uint256 amount
    // ) public virtual returns (bool) {
    //     revert(
    //         "LoyaltyToken: Direct customer-to-customer transfers are disabled."
    //     );
    // }

    // function allowance(
    //     address owner,
    //     address spender
    // ) public view virtual returns (uint256) {
    //     revert("LoyaltyToken: Allowances are disabled.");

    //     return 0;
    // }

    // function approve(
    //     address spender,
    //     uint256 amount
    // ) public virtual returns (bool) {
    //     revert("LoyaltyToken: Approvals are disabled.");
    // }

    // function transferFrom(
    //     address sender,
    //     address recipient,
    //     uint256 amount
    // ) public virtual returns (bool) {
    //     revert("LoyaltyToken: transferFrom is disabled.");
    // }
}
