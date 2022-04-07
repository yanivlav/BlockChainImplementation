const {Blockchain,Block}=require('./blockchain.js')

let micaCoin=new Blockchain()
micaCoin.addBlock(new Block(1,"2/2/2012",{amount:4}))
micaCoin.addBlock(new Block(2, "2/2/2012", {amount: 8}))

console.log(JSON.stringify(micaCoin,null,4))