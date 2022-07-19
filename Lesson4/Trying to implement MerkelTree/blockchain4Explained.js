//const crypto = require('crypto')
const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const {
  MerkleTree
} = require('merkletreejs')

const {
  PartitionedBloomFilter
} = require('bloom-filters')
////create a PartitionedBloomFilter of size 10 with 5 hash functions
//const filter = new PartitionedBloomFiltr(10, 5)


class Transaction {

  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {number} amount
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.timestamp = Date.now()
  }


  /**
   * Creates a SHA256 hash of the transaction
   *
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString()
  }

  /**
   * Signs a transaction with the given signingKey (which is an Elliptic keypair
   * object that contains a private key). The signature is then stored inside the
   * transaction object and later stored on the blockchain.
   *
   * @param {string} signingKey
   */
  signTransaction(signingKey) {
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the fromAddress matches your publicKey
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transaction for other wallets')
    }
    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction obect
    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')
    this.signature = sig.toDER('hex')
  }

  /**
   * Checks if the signature is valid (transaction has not been tampered with).
   * It uses the fromAddress as the public key.
   *
   * @returns {boolean}
   */
  isValid() {
    // If the transaction doesn't have a from address we assume it's a
    // mining reward and that it's valid. You could verify this in a
    // different way (special field for instance)
    
    if (this.fromAddress === null) return true
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in the transaction')
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }

} //Transaction

class Block {

  /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions//MerkleTree
   * @param {string} previousHash
   */
  constructor(timestamp, transactions, previousHash = '', merkleRoot) {
    this.previousHash = previousHash
    this.merkleRoot = merkleRoot
    this.timestamp = timestamp
    this.transactions = transactions
    this.hash = this.calculateHash()
    this.nonce = 0
    
    
/* 
    //C
    const leaves = transactions.map(x => SHA256(x))// x.hash?
    this.tree = new MerkleTree(leaves, SHA256)
    this.root = tree.getRoot().toString('hex')
 */
  /*
    ////Add a new transaction as leaf
      // leaf = SHA256('a') 

    ////Get proof a leaf in tree
      // proof = tree.getProof(leaf)

    ////Verifying leaf in tree
      // console.log(tree.verify(proof, leaf, root)) // true

      // const badLeaves = ['a', 'x', 'c'].map(x => SHA256(x))
      // const badTree = new MerkleTree(badLeaves, SHA256)
      // const badLeaf = SHA256('x')
      // const badProof = tree.getProof(badLeaf)
      // console.log(tree.verify(badProof, leaf, root)) // false
    */
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  calculateHash() {
    /*
      const leaves = transactions.map(x => SHA256(x))
      this.tree = new MerkleTree(leaves, SHA256)
      this.root = tree.getRoot().toString('hex')
    */
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString()
  }

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()

    }

    console.log('Block minded  ' + this.nonce)
  }

  /**
   * Validates all the transactions inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid.
   *
   * @returns {boolean}
   */
  hasValidTransaction() {
    for (const tx of this.transactions) {// < 
      if (!tx.isValid()) {
        return false
      }

    }
    return true
  }

} //Block

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()] //list
    this.difficulty = 2
    this.pendingTransactions = [] 
    this.miningReward = 20
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block("01/01/2019", "Genesis Block", "0")
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   * //Calls to block.mineBlock()
   * @param {string} miningRewardAddress
   */
  minePendingTransactions(miningRewardAddress) {
    //Reward for the miner
    //Takes all the pending transactions, add the new Reward  
    const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward)
    // this.pendingTransactions.push(rewardTX) 
   //miner reward
    let memPool = []
    memPool.push(rewardTX)
    if (this.pendingTransactions.length > 0){
      memPool.push(this.pendingTransactions.shift())
    }
    if (this.pendingTransactions.length > 0) {
      memPool.push(this.pendingTransactions.shift())
    }
    if (this.pendingTransactions.length > 0) {
      memPool.push(this.pendingTransactions.shift())
    }
      
    //mempool of 3 transactions as FIFO
    // for (let i = 0; i < 3; i++) {
    //   if(this.pendingTransactions){
    //     pool.unshift(this.pendingTransactions.shift())
    //   }
  

    //merkle tree
    const leaves = memPool.map(x => SHA256(x))
    const tree = new MerkleTree(leaves, SHA256)
    const root = tree.getRoot().toString('hex')

    //Creating a new block object and initiate mining process on the new block with the difficulty
    let block = new Block(Date.now(), memPool, this.getLatestBlock().hash, root)
    block.mineBlock(this.difficulty)
    console.log('Block successfully mines!')
    this.chain.push(block)

    //this.pendingTransactions = []
  }

  /**
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
  getBalanceOfAddress(address) {
    let balance = 0
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount
        }
        if (trans.toAddress === address) {
          balance += trans.amount
        }
      }
    }
    return balance
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {//Done after new Block is created

    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    // const realGenesis = JSON.stringify(this.createGenesisBlock());
    //takan from 
    // if (realGenesis !== JSON.stringify(this.chain[0])) {
    //   return false;
    // }


    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (!currentBlock.hasValidTransaction()) {
        return false
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }

    }
    return true
  }

  /**
   * Add a new transaction to the list of pending transactions (to be added
   * next time the mining process starts). This verifies that the given
   * transaction is properly signed.
   *
   * @param {Transaction} transaction
   */
   addTransaction(transaction){
      if(!transaction.fromAddress || !transaction.toAddress){
        throw new Error('Transaction must have from and to addresses')
      }
      if(!transaction.isValid()){
        throw new Error('Cannont add invalid transaction to the chain')

      }
/*       /////// more checking functions row 190 - 216
      ////https://github.com/Savjee/SavjeeCoin/blob/master/src/blockchain.js#L58
        this.pendingTransactions.push(transaction)
        debug('transaction added: %s', transaction);//for debug */
    } 

  /**Was added from https://github.com/Savjee/SavjeeCoin/blob/master/src/blockchain.js#L223
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
  /* getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    debug('getBalanceOfAdrees: %s', balance);
    return balance;
  } */

  /* addBlock(newBlock){
      newBlock.previousHash=this.getLatestBlock().hash
      newBlock.mineBlock(this.difficulty)
      this.chain.push(newBlock)
    }
    */

} //Blockchain

module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction