const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const { MerkleTree } = require('merkletreejs')
const { PartitionedBloomFilter } = require('bloom-filters')



class Transaction {
  constructor(fromAddress, toAddress, amount, compensation = 0) {
    // this.fee = 2
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.amount = amount + compensation + 1 //miner compensation reward think!!!!!!!
    this.timestamp = Date.now()
    this.compensation = compensation
  }
  calculateHash() { return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString() }
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

  isFundsSufficient(balance) {
    if (balance < this.amount) {
      throw new Error('No sufficient funds to preform transaction')
    }
  }

}

class Block {
  constructor(timestamp, transactions, previousHash = '', tree, root) {//,filter){
    // constructor(timestamp,transactions,previousHash=''){

    this.previousHash = previousHash
    this.timestamp = timestamp
    this.transactions = transactions
    this.hash = this.calculateHash()
    this.nonce = 0
    this.root = root
    this.tree = tree

    //this.filter=filter
  }
  calculateHash() {//add root and tree
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString()
  }
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log('Block minded  ' + this.nonce)
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
    this.difficulty = 4
    this.pendingTransactions = []
    this.sumCoinsBurned = 0
    this.memPool = []
    this.miningReward = 20
    this.sumCoinMinded = 0
    this.totalSupply = 21000000
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
    this.pendingTransactions.sort((a, b) => a.compensation - b.compensation)

    while (this.pendingTransactions.length > 0 && j < 3) {
      if (this.pendingTransactions[this.pendingTransactions.length - 1].compensation > 0) {
        let mytrans = this.pendingTransactions.pop()
        this.memPool.push(mytrans)
        rewardFromCompensation++
      }
      else
        this.memPool.push(this.pendingTransactions.shift())
      j++;
    }

    const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward + rewardFromCompensation)
    this.memPool.push(rewardTX)

    const leaves = this.memPool.map(x => SHA256(x))
    const tree = new MerkleTree(leaves, SHA256)
    const root = tree.getRoot().toString('hex')

    // const filter = new PartitionedBloomFilter(10, 5)
    // filter.add(rewardTX.signature)

    // const hashTx=this.calculateHash()
    // const sig=signingKey.sign(hashTx,'base64')
    // this.signature=sig.toDER('hex')
    // for (const x of memPool){
    //     // console.log(x) ------------------------
    //     // sumCoinsMinded+= x.amount --------------------------------
    //     filter.add(x)
    // }    
    this.updateSumOfMindedCoins()
    let block = new Block(Date.now(), this.memPool, this.getLatestBlock().hash)//, tree, root)//, filter)
    block.mineBlock(this.difficulty)
    console.log('Block successfully mines!')
    this.chain.push(block)
    this.memPool = []
    rewardFromCompensation = 0 // i think we can delete this line but not sure
    this.printBlockDitailes(block)
    
  }

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


  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must have from and to addresses')
    }
    if (!transaction.isValid()) {
      throw new Error('Cannont add invalid transaction to the chain')
    }

    let balance = this.getBalanceOfAddress(transaction.fromAddress)
    transaction.isFundsSufficient(balance)

    console.log('##############A new transaction was made##############')
    console.log('From:' + transaction.fromAddress)
    console.log('To:' + transaction.toAddress)
    console.log('Amount:' + transaction.amount)
    console.log('Signature:' + transaction.signature)
    console.log('===============================================================================================================================================================================================================')
    this.pendingTransactions.push(transaction)

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

  updateSumOfMindedCoins() {
    if (this.totalSupply > 20) {
      this.totalSupply -= 20
      this.sumCoinMinded += 20
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

  printBlockDitailes(block){
    console.log('Block: ' + this.chain.length + ' was successfully mined!')
    console.log('Your wallet was rewarded with ' + this.miningReward + ' coins')
    // console.log('Coins burned in this block: ' + burnAmount)
    console.log('Total coins burned: ' + this.sumCoinsBurned)
    console.log('Coin total supply: ' + this.totalSupply)
    console.log(JSON.stringify(block, null, 4))
    console.log('===============================================================================================================================================================================================================')

    // function sleep(milliseconds) {
    //   const date = Date.now();
    //   let currentDate = null;
    //   do {
    //     currentDate = Date.now();
    //   } while (currentDate - date < milliseconds);
    // }
    // sleep(1000);
  }

}

module.exports.Blockchain = Blockchain
module.exports.Block = Block
module.exports.Transaction = Transaction