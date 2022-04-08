const SHA256=require('crypto-js/sha256')
 const EC = require('elliptic').ec
 const ec = new EC('secp256k1')
const { MerkleTree } = require('merkletreejs')



class Transaction{
    constructor(fromAddress,toAddress,amount){
      this.fromAddress=fromAddress
      this.toAddress=toAddress
      this.amount=amount
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

  isValid(){ // Add get proof verify
  if(this.fromAddress===null)return true
  if(!this.signature||this.signature.length===0){
   throw new Error('No signature in the transaction')
  }
   
  const publicKey=ec.keyFromPublic(this.fromAddress,'hex')
  return publicKey.verify(this.calculateHash(),this.signature)
}

}

class Block{
constructor(timestamp,root,previousHash='',tree){
    
    this.previousHash=previousHash
    this.timestamp=timestamp
    this.root=root
    this.hash=this.calculateHash()
    this.nonce=0
    this.tree=tree
}
calculateHash(){
  return SHA256(this.previousHash+this.timestamp+JSON.stringify(this.transactions)+this.nonce).toString()//add the root and the tree
 }
 mineBlock(difficulty){ //Check
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
        this.difficulty=2
        //this.pendingTransactions=[]
        this.pendingTransactions = new Queue()
        this.miningReward=20
    }

    createGenesisBlock(){
        return new Block("01/01/2019","Genesis Block","0")
    }

    getLatestBlock(){
      return this.chain[this.chain.length-1]
    }

    // addBlock(newBlock){
    //   newBlock.previousHash=this.getLatestBlock().hash
    //   newBlock.mineBlock(this.difficulty)
    //   this.chain.push(newBlock)
    // }
    minePendingTransactions(miningRewardAddress){

 
const leaves = ['a', 'b', 'c'].map(x => SHA256(x))
const tree = new MerkleTree(leaves, SHA256)
const root = tree.getRoot().toString('hex')
const leaf = SHA256('a')
const proof = tree.getProof(leaf)
console.log(tree.verify(proof, leaf, root)) // true




      const rewardTX =new Transaction(null,miningRewardAddress,this.miningReward)
      this.pendingTransactions.enqueue(rewardTX)
      transactionToBlock = []
      for (let i = 0; i<4; i++){
        transactionToBlock.push(this.pendingTransactions.dequeue())
      }
      const leaves = transactionToBlock.map(x => SHA256(x))
      let block=new Block(Date.now(),this.pendingTransactions,this.getLatestBlock().hash)
      block.mineBlock(this.difficulty)
      console.log('Block successfully mines!')
      this.chain.push(block)


      this.pendingTransactions=[]
    }

    getBalanceOfAddress(address){
      let balance=0
      for(const block of this.chain){
        for(const trans of block.transactions){
          if(trans.fromAddress===address){
            balance -= trans.amount
          }
          if(trans.toAddress===address){
            balance +=trans.amount
          }
        }
      }
      return balance
    }

    addTransaction(transaction){// wolet uses this function
      if(!transaction.fromAddress|| !transaction.toAddress){
        throw new Error('Transaction must have from and to addresses')
      }
      if(!transaction.isValid()){
        throw new Error('Cannont add invalid transaction to the chain')

      }

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