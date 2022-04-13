const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const { MerkleTree } = require('merkletreejs')
const { PartitionedBloomFilter } = require('bloom-filters')


class Transaction {
  constructor(fromAddress, toAddress, amount, compensation = 0, comment = "") {
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount
    this.amountSender = amount + compensation
    this.amountReceiver = amount
    this.timestamp = Date.now()
    this.compensation = compensation
    this.comment = comment
  }
  calculateHash() { return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.amountSender).toString() }
  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transaction for other wallets')
    }
    const hashTx = this.calculateHash()
    const sig = signingKey.sign(hashTx, 'base64')
    this.signature = sig.toDER('hex')
  }
  isValid() {
    if (this.fromAddress === null) return true
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in the transaction')
    }
    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
    return publicKey.verify(this.calculateHash(), this.signature)
  }
}



class Block {
  constructor(timestamp, transactions, previousHash = '', tree, root, filter) {
    this.previousHash = previousHash
    this.timestamp = timestamp
    this.transactions = transactions
    this.hash = this.calculateHash()
    this.nonce = 0
    this.root = root
    this.tree = tree
    this.filter = filter
  }
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions)
      + this.nonce + this.tree + this.root + this.filter).toString()
  }
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }
    console.log('Nonce: ' + this.nonce)
  }
  hasValidTransaction() {
    for (const tx of this.transactions) 
      if (!tx.isValid()) 
        return false
    return true
  }
}



class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 4
    this.pendingTransactions = []
    this.memPool = []
    this.miningReward = 20
    this.totalMined = 0
    this.coinCapacity = 21000000
    this.totalSupply = this.coinCapacity
    this.secondsBetweenBlocks = 0
    this.burnAddress = '041e386aa276de1162b6a4e5ed352a88c76f3b66f2835a1afc7f7e15608e18b4bcede9949220d1279c5eb0c804a141c252c7573b1f0f044bde3b6bc5df4b7b8cc1'
    this.totalBurned = 0
  }
  createGenesisBlock() {
    return new Block("01/01/2019", "Genesis Block", "0")
  }
  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }
  minePendingTransactions(miningRewardAddress) {
    let j = 0
    let rewardFromCompensation = 0
    let burnAmount = 0

    // Comparator sorting
    // The goal is to help the miner to choose transactions that wallet owners prioritized
    this.pendingTransactions.sort((a, b) => a.compensation - b.compensation)

    // Fixed size for the block, rewardTX, burnedTX, 
    // Two more from pending by priority with compensation or with out 
    while (this.pendingTransactions.length > 0 && j < 2) { 
      //If there were a compensation meaning wallet owner prioritized the transaction
      if (this.pendingTransactions[this.pendingTransactions.length - 1].compensation > 0) {
        let mytrans = this.pendingTransactions.pop()

        //Calculation of  burning and fees
        // if (mytrans.compensation > 1){ //why buren only from 2 and on and not from 1?
        burnAmount += mytrans.compensation - 1
        // }

        rewardFromCompensation += mytrans.compensation - burnAmount // always equal to 1 right?
        burnAmount = 0
        mytrans.amount -= mytrans.compensation
        this.memPool.push(mytrans)
      }
      else { //No prioritizing for the transaction
        let mytrans = this.pendingTransactions.shift()
        this.memPool.push(mytrans)
      }
      j++;
    }

    const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward +
      rewardFromCompensation, 0, "Mining Reward: " + this.miningReward + " coins, Compensation: " + rewardFromCompensation)
    this.memPool.push(rewardTX)


    const burnTX = new Transaction(null, this.burnAddress, 1 * (this.chain.length) +
      burnAmount, 0, "Burned Coins by block: " + (this.chain.length) + ", Burned by too high gas fee (compensation > 1): " + burnAmount)
    this.burn(burnTX.amount) // what is it
    this.memPool.push(burnTX)

    const leaves = this.memPool.map(x => SHA256(x).toString())
    const tree = new MerkleTree(leaves, SHA256)
    const root = tree.getRoot().toString('hex')
    const filter = new PartitionedBloomFilter(50, 5)

    //think if to sing burnTX and rewardTX to the filter ?  
    //pay attention that burnTX and rewardTX has no signing,
    // if so deferent approach with filter and signature

    // filter.add(rewardTX.calculateHash())

    //Filling filter with real client transaction, no rewardTx and no burnTX
    for (let i = 0; i < 2; i++) { 
      if (!(this.memPool[i].signature === undefined)) {
        filter.add(this.memPool[i].signature.toString())
      }
    }

    this.updateSumOfMinedCoins()
    let block = new Block(Date.now(), this.memPool, this.getLatestBlock().hash, tree, root, filter)
    block.mineBlock(this.difficulty)
    this.chain.push(block)
    this.memPool = []

    // function sleep(milliseconds) {
    //   const date = Date.now();
    //   let currentDate = null;
    //   do {
    //     currentDate = Date.now();
    //   } while (currentDate - date < milliseconds);
    // }
    // sleep(this.secondsBetweenBlocks * 1000);
    this.printBlockDetails(block)
  }
  getBalanceOfAddress(address) {
    let balance = 0
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amountSender // Amount sender include prioritizing 
        }
        if (trans.toAddress === address) {
          balance += trans.amountReceiver // Amount sender doesn't include prioritizing 
        }
      }
    }
    return balance
  }
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) 
      throw new Error('Transaction must have from and to addresses')
    
    if (!transaction.isValid())
      throw new Error('Cannot add invalid transaction to the chain')

    let balance = this.getBalanceOfAddress(transaction.fromAddress)
    if (balance <= 0)
      throw new Error('No sufficient funds to preform transaction')

    if (transaction.amount > balance)
      throw new Error('No sufficient funds to preform transaction')

    console.log("Transaction in pending to be minded")
    this.transactionDetails(transaction)
    this.pendingTransactions.push(transaction)
  }
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]
      if (!currentBlock.hasValidTransaction()) { return false }
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }
    }
    return true
  }

  transactionLookupInTheBlockchainBloomFilter(transaction) {// spv check
    console.log('=====================================================================================================================================================================================================')
    console.log("\nRunning SPV")
    if (!(transaction instanceof Transaction)) {
      return console.log("Input is not instanceof Transaction")
    }
    for (let i = 0; i < this.chain.length; i++) { // Checking BloomFilter ,  i!=1 becuase genesis block has no filter
      const currentBlock = this.chain[i]
      if (!(currentBlock.filter === undefined) && currentBlock.filter.has(transaction.signature) === true) 
        if (this.myVerify(transaction, currentBlock, i)) //Running Proof and verification on the MerkeTree
          return
    }
    return console.log("Transaction does not exist in the BlockChain, it might be pending for mining!\n")
  }

  myVerify(transaction, possibleBlocks, blockNumber) {
    const leaf = SHA256(transaction).toString()
    const root = possibleBlocks.tree.getRoot().toString('hex')
    const proof = possibleBlocks.tree.getProof(leaf)
    if (possibleBlocks.tree.verify(proof, leaf, root)){
      console.log("Transaction is verified in the blockchain, Block Number: " + blockNumber)
      console.log("Tree Proof:\n")
      console.log(proof)
    }
    return possibleBlocks.tree.verify(proof, leaf, root)
  }

  updateSumOfMinedCoins() {
    if (this.totalSupply > 20) {
      this.totalSupply -= 20
      this.totalMined += 20
    }
    else
      throw new Error('Total coins supply reached!')
  }
  getSumOfMindedCoins() {
    return sumCoinMinded
  }
  compareCompensation(a, b) { // Comparator
    return a.compensation - b.compensation
  }
  printBlockDetails(block) {
    console.log('Block: ' + this.chain.length, ' ,Difficulty: ' + this.difficulty)
    console.log('Total coins: ' + this.coinCapacity + ', Total mined: ' + this.totalMined)
    console.log('Total supply: ' + this.totalSupply + ', Total burned: ' + this.totalBurned)
    // console.log(JSON.stringify(block, null, 4))
    console.log('=====================================================================================================================================================================================================')

    var x = block
    function omitKeys(obj, keys) {
      var dup = {};
      for (var key in obj) {
        if (keys.indexOf(key) == -1) {
          dup[key] = obj[key];
        }
      }
      return dup;
    }

    // console.log(JSON.stringify(omitKeys(x, ['tree']) ,null, 4))
    console.log('===============================================================================================================================================================================')
  }
  burn(amount) {
    if (this.totalSupply >= amount) {
      this.totalSupply -= amount
      this.totalBurned += amount
    } else
      throw new Error('Cannot burn more coins')
  }

  transactionDetails(transaction) {
    console.log('##############A new transaction was made##############')
    console.log('From:' + transaction.fromAddress)
    console.log('To:' + transaction.toAddress)
    console.log('Amount:' + transaction.amount)
    console.log('Signature:' + transaction.signature)
    console.log('=====================================================================================================================================================================================================')
  }
}


module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction