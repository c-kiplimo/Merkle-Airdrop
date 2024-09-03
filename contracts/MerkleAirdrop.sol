// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop {
    bytes32 public merkleRoot;
    IERC20 public token;
    address public owner;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);
    event MerkleRootUpdated(bytes32 newMerkleRoot);
    event RemainingTokensWithdrawn(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(IERC20 tokenAddress, bytes32 root) {
        token = tokenAddress;
        merkleRoot = root;
        owner = msg.sender;
    }

    function claimAirdrop(bytes32[] calldata merkleProof, uint256 amount) external {
        require(!hasClaimed[msg.sender], "MerkleAirdrop: Airdrop already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "MerkleAirdrop: Invalid proof");

        hasClaimed[msg.sender] = true;
        require(token.transfer(msg.sender, amount), "MerkleAirdrop: Transfer failed");

        emit AirdropClaimed(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    function withdrawRemainingTokens(address recipient) external onlyOwner {
        uint256 remainingBalance = token.balanceOf(address(this));
        require(token.transfer(recipient, remainingBalance), "MerkleAirdrop: Transfer failed");

        emit RemainingTokensWithdrawn(recipient, remainingBalance);
    }
}
