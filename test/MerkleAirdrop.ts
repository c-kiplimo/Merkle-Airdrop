import { ethers } from "hardhat";
import { expect } from "chai";
import { Signer } from "ethers";
import { MyERC20Token, MerkleAirdrop } from "../typechain-types";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("MerkleAirdrop", function () {
    let token: MyERC20Token;
    let airdrop: MerkleAirdrop;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;
    let addr3: Signer;

    // Sample addresses and amounts
    const addresses = [
        { address: "0x1234567890123456789012345678901234567890", amount: 100 },
        { address: "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd", amount: 200 }  // Valid address
    ];

    let merkleRoot: string;
    const abiCoder = new ethers.AbiCoder(); // Create an AbiCoder instance
    const leaves = addresses.map(({ address, amount }) =>
        keccak256(abiCoder.encode(["address", "uint256"], [address, amount]))
    );

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Create a Merkle tree and get the root
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        merkleRoot = tree.getRoot().toString('hex');

        // Deploy the ERC20 token contract
        const TokenFactory = await ethers.getContractFactory("MyERC20Token");
        token = (await TokenFactory.deploy()) as MyERC20Token;

        // Wait for the contract to be deployed
        await token.deployed();

        // Mint some tokens to the owner
        await token.mint(await owner.getAddress(), ethers.utils.parseUnits("1000", 18));

        // Deploy the MerkleAirdrop contract
        const AirdropFactory = await ethers.getContractFactory("MerkleAirdrop");
        airdrop = (await AirdropFactory.deploy(token.address, `0x${merkleRoot}`)) as MerkleAirdrop;

        // Wait for the contract to be deployed
        await airdrop.deployed();
    });

    it("Should deploy the contracts and set the correct Merkle root", async function () {
        expect(await airdrop.merkleRoot()).to.equal(`0x${merkleRoot}`);
    });

    it("Should allow a valid claim", async function () {
        const leaf = keccak256(abiCoder.encode(["address", "uint256"], [addresses[0].address, addresses[0].amount]));
        const proof = new MerkleTree(leaves, keccak256, { sortPairs: true }).getProof(leaf).map(p => `0x${p.data.toString('hex')}`);

        await airdrop.connect(addr1).claimAirdrop(proof, addresses[0].amount);

        expect(await token.balanceOf(await addr1.getAddress())).to.equal(ethers.utils.parseUnits("100", 18));
        expect(await airdrop.hasClaimed(await addr1.getAddress())).to.be.true;
    });

    it("Should reject an invalid claim", async function () {
        const invalidProof = ["0x0000000000000000000000000000000000000000000000000000000000000000"];
        await expect(airdrop.connect(addr1).claimAirdrop(invalidProof, addresses[0].amount)).to.be.revertedWith("MerkleAirdrop: Invalid proof");
    });

    it("Should reject double claims", async function () {
        const leaf = keccak256(abiCoder.encode(["address", "uint256"], [addresses[0].address, addresses[0].amount]));
        const proof = new MerkleTree(leaves, keccak256, { sortPairs: true }).getProof(leaf).map(p => `0x${p.data.toString('hex')}`);

        await airdrop.connect(addr1).claimAirdrop(proof, addresses[0].amount);
        await expect(airdrop.connect(addr1).claimAirdrop(proof, addresses[0].amount)).to.be.revertedWith("MerkleAirdrop: Airdrop already claimed");
    });

    it("Should allow the owner to withdraw remaining tokens", async function () {
        await airdrop.connect(owner).withdrawRemainingTokens(await addr1.getAddress());
        expect(await token.balanceOf(await addr1.getAddress())).to.equal(ethers.utils.parseUnits("1000", 18));
    });
});
