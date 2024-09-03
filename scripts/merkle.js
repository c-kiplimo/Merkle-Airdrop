const fs = require('fs');
const csv = require('csv-parser');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const csvFilePath = 'addresses.csv'; // Path to your CSV file

function hashEntry(address, amount) {
  return keccak256(`${address}-${amount}`);
}

function generateMerkleRoot(entries) {
  const leaves = entries.map(entry => hashEntry(entry.address, entry.amount));
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  return tree.getRoot().toString('hex');
}

function readCSVAndGenerateRoot(filePath) {
  const entries = [];
  
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      entries.push({
        address: data.address,
        amount: data.amount
      });
    })
    .on('end', () => {
      const root = generateMerkleRoot(entries);
      console.log(`Merkle Root: ${root}`);
    });
}

readCSVAndGenerateRoot(csvFilePath);
