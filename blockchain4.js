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
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce + this.tree + this.root + this.filter).toString()
  }
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log('Nonce: ' + this.nonce)
  }
  hasValidTransaction() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false
      }

    }
    return true
  }
}



class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 3
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
    this.pendingTransactions.sort((a, b) => a.compensation - b.compensation)

    while (this.pendingTransactions.length > 0 && j < 2) { //why 2 and not 4 burn is a transaction?
      if (this.pendingTransactions[this.pendingTransactions.length - 1].compensation > 0) {

        let mytrans = this.pendingTransactions.pop()
        if (mytrans.compensation > 1) {
          burnAmount += mytrans.compensation - 1

        }

        rewardFromCompensation += mytrans.compensation - burnAmount
        burnAmount = 0
        mytrans.amount -= mytrans.compensation
        this.memPool.push(mytrans)
      }
      else {
        this.memPool.push(this.pendingTransactions.shift())
      }
      j++;
    }

    const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward + rewardFromCompensation, 0, "Mining Reward: " + this.miningReward + " coins, Compensation: " + rewardFromCompensation)
    this.memPool.push(rewardTX)
    const burnTX = new Transaction(null, this.burnAddress, 1 * (this.chain.length) + burnAmount, 0, "Burned Coins by block: " + (this.chain.length) + ", Burned by too high gas fee (compensation > 1): " + burnAmount)
    this.burn(burnTX.amount) // what is it
    this.memPool.push(burnTX)

    const leaves = this.memPool.map(x => SHA256(x))
    const tree = new MerkleTree(leaves, SHA256)
    const root = tree.getRoot().toString('hex')
    const filter = new PartitionedBloomFilter(10, 5)
    filter.add(rewardTX.calculateHash())
    for (const x of this.memPool) {
      filter.add(x.calculateHash())
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
          balance -= trans.amountSender
          // balance -= trans.amount

        }
        if (trans.toAddress === address) {
          balance += trans.amountReceiver
          // balance += trans.amount
        }
      }
    }
    return balance
  }
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must have from and to addresses')
    }
    if (!transaction.isValid()) {
      throw new Error('Cannont add invalid transaction to the chain')
    }

    let balance = this.getBalanceOfAddress(transaction.fromAddress)
    if (balance <= 0) {
      throw new Error('No sufficient funds to preform transaction')
    }

    if (transaction.amount > balance) {
      throw new Error('No sufficient funds to preform transaction')
    }
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
    let possibleBlocks = []
    if (!(transaction instanceof Transaction)) {
      console.log("Transaction is invalid or no transaction at all")
    }
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      if (currentBlock.filter.has(transaction.calculateHash()) === true) {
        possibleBlocks.push(currentBlock)
      }
    }

    console.log("\nRunning SPV")
    for (let i = 0; i < possibleBlocks.length; i++) {
      if (this.myVerify(transaction, possibleBlocks[i])) {
        console.log(i)
        console.log("Transaction is verified in the blockchain\n")
      }
    }
    console.log("Transaction does not exist!\n")
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
  compareCompensation(a, b) {
    return a.compensation - b.compensation
  }
  printBlockDetails(block) {
    console.log('Block: ' + this.chain.length, ' ,Difficulty: ' + this.difficulty)
    console.log('Total coins: ' + this.coinCapacity + ', Total mined: ' + this.totalMined)
    console.log('Total supply: ' + this.totalSupply + ', Total burned: ' + this.totalBurned)
    // console.log(JSON.stringify(block, null, 4))
    console.log('=====================================================================================================================================================================================================')

    // var x = block
    // function omitKeys(obj, keys) {
    //   var dup = {};
    //   for (var key in obj) {
    //     if (keys.indexOf(key) == -1) {
    //       dup[key] = obj[key];
    //     }
    //   }
    //   return dup;
    // }

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
  myVerify(transaction, possibleBlocks) {
    const leaf = SHA256(transaction)
    const root = possibleBlocks.tree.getRoot().toString('hex')
    const proof = possibleBlocks.tree.getProof(leaf)
    console.log(possibleBlocks.tree.verify(proof, leaf, root))
    return possibleBlocks.tree.verify(proof, leaf, root)
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