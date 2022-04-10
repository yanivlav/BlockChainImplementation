  const SHA256=require('crypto-js/sha256')
  const EC = require('elliptic').ec
  const ec = new EC('secp256k1')
  const {MerkleTree} = require('merkletreejs')
  const {PartitionedBloomFilter} = require('bloom-filters')



  class Transaction{
    constructor(fromAddress,toAddress,amount, com){
      this.fee = 2
      this.fromAddress=fromAddress
      this.toAddress=toAddress
      this.amount = amount
      this.timestamp=Date.now()
  }
  calculateHash(){return SHA256(this.fromAddress+this.toAddress+this.amount+this.timestamp).toString()}
  signTransaction(signingKey){
    if(signingKey.getPublic('hex')!==this.fromAddress){
      throw new Error('You cannot sign transaction for other wallets')
    }
    const hashTx=this.calculateHash()
    const sig=signingKey.sign(hashTx,'base64')
    this.signature=sig.toDER('hex')
  }

  isValid(){
  if(this.fromAddress===null)return true
  if(!this.signature||this.signature.length===0){
    throw new Error('No signature in the transaction')
  }
    
  const publicKey=ec.keyFromPublic(this.fromAddress,'hex')
  return publicKey.verify(this.calculateHash(),this.signature)
  }

  }

  class Block{
  constructor(timestamp,transactions,previousHash='',tree,root){//,filter){
  // constructor(timestamp,transactions,previousHash=''){

    this.previousHash=previousHash
    this.timestamp=timestamp
    this.transactions=transactions
    this.hash=this.calculateHash()
    this.nonce=0
    this.root=root
    this.tree=tree
    //this.filter=filter
  }
  calculateHash(){//add root and tree
  return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.transactions)+this.nonce).toString()
  }
  mineBlock(difficulty){
    while(this.hash.substring(0,difficulty)!== Array(difficulty+1).join('0')){
      this.nonce++
      this.hash=this.calculateHash()
    }

    console.log('Block minded  '+this.nonce)
  }
  hasValidTransaction(){
      for(const tx of this.transactions){
      if(!tx.isValid()){
        return false
      }
      
      }
      return true
  }


  }
  class Blockchain{
    constructor(){
        this.chain=[this.createGenesisBlock()]
        this.difficulty=3
        this.pendingTransactions=[]
        this.sumCoinsBurned=0
        this.memPool=[]
        this.miningReward=20
    }

    createGenesisBlock(){
        return new Block("01/01/2019","Genesis Block","0")
    }

    getLatestBlock(){
      return this.chain[this.chain.length-1]
    }

    minePendingTransactions(miningRewardAddress){
    const rewardTX = new Transaction(null,miningRewardAddress,this.miningReward)
    this.memPool.push(rewardTX)

    let j=0
    while(this.pendingTransactions.length>0 && j<3 ){
      let trans = this.pendingTransactions.shift()
      this.memPool.push(trans)
      j++;
    }

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
    
    let block=new Block(Date.now(),this.memPool,this.getLatestBlock().hash, tree, root)//, filter)
    block.mineBlock(this.difficulty)
    console.log('Block successfully mines!')
    this.chain.push(block)
    this.memPool=[]
  }

    getBalanceOfAddress(address){
      let balance=0
      for(const block of this.chain){
        for(const trans of block.transactions){
          if(trans.fromAddress===address){
            balance -= trans.amount
          }
          if(trans.toAddress===address){
            balance += trans.amount
          }
        }
      }
      return balance
    }

    addTransaction(transaction){
      if(!transaction.fromAddress|| !transaction.toAddress){
        throw new Error('Transaction must have from and to addresses')
      }
      if(!transaction.isValid()){
        throw new Error('Cannont add invalid transaction to the chain')

      }
      console.log("transaction amount is:" + transaction.amount)
      this.sumCoinsBurned += transaction.fee
      transaction.amount -= transaction.fee
      this.pendingTransactions.push(transaction)
    } 


    isChainValid(){
        for (let i = 1; i < this.chain.length; i++) {
          const currentBlock=this.chain[i]
          const previousBlock=this.chain[i-1]
          if(!currentBlock.hasValidTransaction()){return false}
          if(currentBlock.hash !== currentBlock.calculateHash()){
          return false
          }
          
          if(currentBlock.previousHash !== previousBlock.hash){
            return false
          }
        }
      return true
    }
  }

  module.exports.Blockchain=Blockchain
  module.exports.Block=Block
  module.exports.Transaction=Transaction