const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const fs = require("fs");
// (1)
const tree = StandardMerkleTree.load(
  JSON.parse(fs.readFileSync("merkletree.json", "utf8"))
);

// (2)
for (const [i, v] of tree.entries()) {
  // generating the proof for address "0x3C46CdDdB6a900fa2b585dd299e03d12FA4293BC" so you can change it
  if (v[0] === "0x3C46CdDdB6a900fa2b585dd299e03d12FA4293BC") {
    // (3)
    const proof = tree.getProof(i);
    console.log("Value:", v);
    console.log("Proof:", proof);
  }
}
