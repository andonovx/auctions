// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NFT is ERC1155 {
    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public constant THORS_HAMMER = 2;
    uint256 public constant SWORD = 3;
    uint256 public constant SHIELD = 4;

    constructor() ERC1155("ipfs://") {
        _mint(0xd1bBDF4339ee066A5E63F05C81Ff43962660a37B, GOLD, 10**18, "");
        _mint(0xd1bBDF4339ee066A5E63F05C81Ff43962660a37B, SILVER, 10**27, "");
        _mint(0xd1bBDF4339ee066A5E63F05C81Ff43962660a37B, THORS_HAMMER, 1, "");
        _mint(0xd1bBDF4339ee066A5E63F05C81Ff43962660a37B, SWORD, 10**9, "");
        _mint(0xd1bBDF4339ee066A5E63F05C81Ff43962660a37B, SHIELD, 10**9, "");
    }
}