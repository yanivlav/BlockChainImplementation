const {Blockchain,Block,Transaction}=require('./blockchain4yaniv.js')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const barKey = ec.keyFromPrivate('4a8c9b48ffb71cae5f8663074b4a7d32a1ed50b4f16b9e12520f96ce4f4b7d22')
const barWalletAddress=barKey.getPublic('hex')

const yanivKey = ec.keyFromPrivate('cf7d0b4494d1344a2ea789e548cd3d94ca4a515dc07b91f579a252eb7bcb0093')
const yanivWalletAddress=yanivKey.getPublic('hex')

const minerKey = ec.keyFromPrivate(' 35c6745760526113b88210ad543fbd9422dd4d9f2b646fda22ed6c4a87060e12')
const minerWalletAddress=minerKey.getPublic('hex')



let micaCoin=new Blockchain()

const tx1=new Transaction(barWalletAddress,yanivWalletAddress,10)
tx1.signTransaction(barKey)
micaCoin.addTransaction(tx1)

const tx2=new Transaction(yanivWalletAddress,barWalletAddress,5)
tx2.signTransaction(yanivKey)
micaCoin.addTransaction(tx2)

micaCoin.minePendingTransactions(minerWalletAddress)

// console.log('\ Balance of miner ', micaCoin.getBalanceOfAddress(minerWalletAddress))
// console.log('\ Balance of bar ', micaCoin.getBalanceOfAddress(barWalletAddress))
// console.log('\ Balance of yaniv ', micaCoin.getBalanceOfAddress(yanivWalletAddress))

console.log(JSON.stringify(micaCoin, null, 4))


// for every place writtenm bar there was mywallet
// let micaCoin=new Blockchain()

// const tx1=new Transaction(barWalletAddress,'address1',10)
// tx1.signTransaction(barKey)
// micaCoin.addTransaction(tx1)

// micaCoin.minePendingTransactions(barWalletAddress)
 
// console.log('\ Balance of Bob ', micaCoin.getBalanceOfAddress(barWalletAddress))

// console.log(JSON.stringify(micaCoin, null, 4))