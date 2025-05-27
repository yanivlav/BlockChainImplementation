<h1 align="center">BlockChain Implementation</h1>

***

## ℹ️ Overview
A simple blockchain implementation in Node.js integrating advanced cryptographic components such as Merkle Tree and Bloom Filter for transaction verification and efficient lookup.

This is a simple blockchain implementation written in Node.js, featuring:
- Block mining with Proof-of-Work difficulty adjustment.
- Merkle Tree for efficient and secure transaction verification within blocks.
- Integration of Partitioned Bloom Filter to optimize transaction lookup within blocks (SPV check).
- Cryptographic signatures using Elliptic Curve Cryptography (secp256k1) for transaction authenticity (signing and verification).
- Transaction prioritization by compensation (gas fee) for miners.
- Mechanisms for coin supply, mining rewards, and coin burning.

Output example of miner:
![image](https://user-images.githubusercontent.com/22189126/179813496-e5a539ef-3d45-42e6-aaf8-05adf69d95cd.png)

## ℹ️ Concepts & Components

### Transaction Class
- Represents a transfer from one wallet to another.
- Supports digital signing and validation using ECC (secp256k1).
- Tracks compensation (transaction fees) and comments.
- Calculates its own hash based on sender, receiver, amount, timestamp, and compensation.

### Block Class
- Contains a set of transactions.
- Links to the previous block hash.
- Computes its own hash, including the Merkle tree root and bloom filter data.
- Mines with Proof-of-Work, iterating nonce until hash meets difficulty criteria.
- Validates all transactions inside it.

### Blockchain Class
- Maintains the chain of blocks.
- Supports pending transactions pool and a mempool for mining.
- Manages mining rewards, total coin supply, and coin burning.
- Implements transaction prioritization based on compensation fees.
- Builds a Merkle Tree from transactions and a Partitioned Bloom Filter to allow quick verification of transaction presence in blocks.
- Provides SPV style transaction verification by combining bloom filter checks and Merkle tree proofs.
- Enforces blockchain integrity with chain validation.

## ℹ️ How Mining Works
- The miner selects up to 2 transactions from the pending pool, prioritizing by compensation (higher fees first).
- Compensation fees partially contribute to miner rewards and partially get "burned" (removed from circulation).
- Mining rewards and burn transactions are automatically created for each mined block.
- Merkle Tree and Bloom Filter are updated and stored in each block for efficient verification.

## ℹ️ Testing & Usage
- Check the main test file (e.g. main.js) in the root directory for examples on creating wallets, signing transactions, adding them to the blockchain, and mining blocks.
- Use the transactionLookupInTheBlockchainBloomFilter() method to verify if a transaction is included in the chain efficiently, leveraging the bloom filter and Merkle tree proof.
- Monitor mining output in the console for block details, nonce, difficulty, total supply, and transactions.

## ℹ️ Dependencies
- crypto-js (SHA256 hashing)
- elliptic (Elliptic Curve cryptography for signing)
- merkletreejs (Merkle Tree construction & verification)
- bloom-filters (Partitioned Bloom Filter for membership checks)
EOF

## ℹ️ Getting Started
For beginners, it is recommended to go through the lessons 0-4 (folders with main[x].js and blockchain[x].js), which gradually introduce blockchain basics, transaction handling, mining, and finally integration of Bloom filters and Merkle trees.

***Lesson0***
- Simple blockchain: Block and BlockChain classes

***Lesson1***
- Adding the isChainValid() to BlockChain

***Lesson2***
- Adding to mineBlock() to Block

***Lesson3***
- Adding Transaction Class
- Removing addBlock() from Block
- Adding minePendingTransactions(miningRewardAddress), getBalanceOfAddress(address), createTransaction(transaction) in BlockChain

***Lesson4***
- Changing createTransaction(transaction) to addTransaction(transaction) in BlockChain
- Add hasValidTransaction() to Block
- Before moving on:
***Read about Bloomfilter and MerkleTree that we are going to use in our blockchain and go check the folder "Components Examples" for better understanding (Lesson4/"Trying to implement MerkelTree" folder has some examples too).***
 
## ℹ️ Now go checkout blockchain4.js and test file main.js in the root directory.

### ✍️ Authors
💿 https://github.com/yanivlav 
💿 https://github.com/BarDAP
