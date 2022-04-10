    const SHA256=require('crypto-js/sha256')
    const EC = require('elliptic').ec
    const ec = new EC('secp256k1')
    const {MerkleTree} = require('merkletreejs')
    const {PartitionedBloomFilter} = require('bloom-filters')



    class Transaction{
      constructor(fromAddress, toAddress, amount, commission) {
        this.fee = 2
        this.com = commission
        this.fromAddress=fromAddress
        this.toAddress=toAddress
        amount -= this.fee + this.com
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
    constructor(timestamp,transactions,previousHash='',root){//,tree,filter){
    // constructor(timestamp,transactions,previousHash=''){

      this.previousHash=previousHash
      this.timestamp=timestamp
      this.transactions=transactions
      this.hash=this.calculateHash()
      this.nonce=0
      this.root=root
      // this.tree=tree
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

      console.log('Nonce: ' + this.nonce)
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
          this.sumCoinsBurned = 0
          this.memPool=[]
          this.miningReward=20
          this.fee=2
          this.totalSupply = 9000000 //
      }

      createGenesisBlock(){
          return new Block("01/01/2019","Genesis Block","0")
      }

      getLatestBlock(){
        return this.chain[this.chain.length-1]
      }

      minePendingTransactions(miningRewardAddress){

        let j=0
        let commissions = 0
        let burnAmount = 0

        while(this.pendingTransactions.length>0 && j<3 ){
          let trans = this.pendingTransactions.shift()
          if(trans.com >= 1){
            commissions += 1
          
            burnAmount += trans.com - 1
          }         
          this.memPool.push(trans)
          j++;
        }
        
        const rewardTX = new Transaction(null, miningRewardAddress, this.miningReward + this.fee +commissions, 0) //- this.fee)
        this.memPool.push(rewardTX)
        
        burnAmount += 1 * (this.chain.length - 1)
        this.sumCoinsBurned += burnAmount
        this.totalSupply -= burnAmount

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
        
        let block=new Block(Date.now(),this.memPool,this.getLatestBlock().hash, root)//, filter)
        block.mineBlock(this.difficulty)
        console.log('Block: '+ this.chain.length +' was successfully mined!')
        console.log('Your wallet was rewarded with '+this.miningReward+ ' coins')
        console.log('Coins burned in this block: ' + burnAmount)
        console.log('Total coins burned: ' + this.sumCoinsBurned)
        console.log('Coin total supply: ' + this.totalSupply)
        console.log(JSON.stringify(block, null, 4))
        console.log('===============================================================================================================================================================================================================')
        this.chain.push(block)
        this.memPool=[]

        function sleep(milliseconds) {
          const date = Date.now();
          let currentDate = null;
          do {
            currentDate = Date.now();
          } while (currentDate - date < milliseconds);
        }
        sleep(1000);
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
      burn(amount){


      }
      addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
          throw new Error('Error: Transaction must have from and to addresses')
        }
        if(!transaction.isValid()){
          throw new Error('Error: Cannont add invalid transaction to the chain')

        }
        if (this.getBalanceOfAddress(transaction.fromAddress) - transaction.amount < 0){
          throw new Error('Error: Out of funds')
        }
        
        // this.sumCoinsBurned += transaction.fee
        // transaction.amount += transaction.fee
        console.log('##############A new transaction was made##############')
        console.log('From:' + transaction.fromAddress)
        console.log('To:' + transaction.toAddress)
        console.log('Amount:' + transaction.amount)
        console.log('Signature:' + transaction.signature)
        console.log('===============================================================================================================================================================================================================')
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