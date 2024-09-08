const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");

const values = [
  ["0x1234567890abcdef1234567890abcdef12345678", "0", "15000000000000000000"],
  ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", "1", "25000000000000000000"],
  ["0x90F79bf6EB2c4f870365E785982E1f101E93b906", "2", "35000000000000000000"],
  ["0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "3", "45000000000000000000"],
  ["0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", "4", "55000000000000000000"],
  ["0x976EA74026E726554dB657fA54763abd0C3a0aa9", "5", "65000000000000000000"],
  ["0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", "6", "75000000000000000000"],
  ["0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "7", "85000000000000000000"],
  ["0xa0Ee7A142d267C1f36714E4a8F75612F20a79720", "8", "95000000000000000000"],
];

const tree = StandardMerkleTree.of(values, ["address", "uint256", "uint256"]);

// (3) Output the Merkle root
console.log("Merkle Root:", tree.root);

// (4) Write the Merkle tree data to a JSON file
fs.writeFileSync("merkletree.json", JSON.stringify(tree.dump(), null, 2), "utf8");

console.log("JSON file created: tree.json");
