const {Blockchain,Block}=require('./blockchain1.js')

let micaCoin=new Blockchain()
micaCoin.addBlock(new Block(1,"2/2/2012",{amount:4}))
micaCoin.addBlock(new Block(2, "2/2/2012", {amount: 8}))
console.log('\nBlockchain valid '+ micaCoin.isChainValid())

console.log('\Changing block...')

micaCoin.chain[1].data={amount:100}
// console.log('\nHash test ' + micaCoin.isChainValid())
// console.log(JSON.stringify(micaCoin, null, 4))
// console.log('\n----------------')

console.log('\nBlockchain valid ' + micaCoin.isChainValid())
console.log('\Changing block...')

micaCoin.chain[1].data = {amount:4}
console.log('\nBlockchain valid ' + micaCoin.isChainValid())



console.log(JSON.stringify(micaCoin,null,4))