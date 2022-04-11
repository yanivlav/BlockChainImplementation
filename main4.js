const {Blockchain,Block,Transaction}=require('./blockchain4.js')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


const barKey = ec.keyFromPrivate('4a8c9b48ffb71cae5f8663074b4a7d32a1ed50b4f16b9e12520f96ce4f4b7d22')
const barWalletAddress=barKey.getPublic('hex')

const yanivKey = ec.keyFromPrivate('cf7d0b4494d1344a2ea789e548cd3d94ca4a515dc07b91f579a252eb7bcb0093')
const yanivWalletAddress=yanivKey.getPublic('hex')

const minerKey = ec.keyFromPrivate(' 35c6745760526113b88210ad543fbd9422dd4d9f2b646fda22ed6c4a87060e12')
const minerWalletAddress=minerKey.getPublic('hex')


let micaCoin=new Blockchain()
for(let i=0; i<10; i++)
micaCoin.minePendingTransactions(minerWalletAddress)

const tx1=new Transaction(minerWalletAddress,yanivWalletAddress,100,0)
tx1.signTransaction(minerKey)
micaCoin.addTransaction(tx1)
micaCoin.minePendingTransactions(minerWalletAddress)

const tx2=new Transaction(minerWalletAddress,barWalletAddress,100,0)
tx2.signTransaction(minerKey)
micaCoin.addTransaction(tx2)
micaCoin.minePendingTransactions(minerWalletAddress)


const tx3=new Transaction(barWalletAddress,yanivWalletAddress,50,2)
tx3.signTransaction(barKey)
micaCoin.addTransaction(tx3)
// micaCoin.minePendingTransactions(minerWalletAddress)

const tx4=new Transaction(yanivWalletAddress,barWalletAddress,25,10)
tx4.signTransaction(yanivKey)
micaCoin.addTransaction(tx4)
// micaCoin.minePendingTransactions(minerWalletAddress)

const tx5=new Transaction(barWalletAddress,yanivWalletAddress,12,0)
tx5.signTransaction(barKey)
micaCoin.addTransaction(tx5)
// micaCoin.minePendingTransactions(minerWalletAddress)

const tx6=new Transaction(yanivWalletAddress,barWalletAddress,32,0)
tx6.signTransaction(yanivKey)
micaCoin.addTransaction(tx6)
micaCoin.minePendingTransactions(minerWalletAddress)

// let myRandTransaction = 0 
// initiateTransactionArray = []

// for (let i=0; i<28; i++)
// {
//     if(i%2){
//         myRandTransaction = 1 + getRandomInt(micaCoin.getBalanceOfAddress(barWalletAddress))
//         initiateTransactionArray[i] = new Transaction(barWalletAddress,yanivWalletAddress,myRandTransaction)
//         initiateTransactionArray[i].signTransaction(barKey)
//         micaCoin.addTransaction(initiateTransactionArray[i])
//     }
//     else
//     {
//         myRandTransaction = 1 + getRandomInt(micaCoin.getBalanceOfAddress(yanivWalletAddress))
//         initiateTransactionArray[i]=new Transaction(yanivWalletAddress,barWalletAddress,myRandTransaction)
//         initiateTransactionArray[i].signTransaction(yanivKey)
//         micaCoin.addTransaction(initiateTransactionArray[i])
//     }
// }

// micaCoin.minePendingTransactions(minerWalletAddress)

// console.log(JSON.stringify(micaCoin, null, 4))

console.log('\ Balance of miner ', micaCoin.getBalanceOfAddress(minerWalletAddress))
console.log('\ Balance of bar ', micaCoin.getBalanceOfAddress(barWalletAddress))
console.log('\ Balance of yaniv ', micaCoin.getBalanceOfAddress(yanivWalletAddress))




// for every place writtenm bar there was mywallet
// let micaCoin=new Blockchain()

// const tx1=new Transaction(barWalletAddress,'address1',10)
// tx1.signTransaction(barKey)
// micaCoin.addTransaction(tx1)

// micaCoin.minePendingTransactions(barWalletAddress)
 
// console.log('\ Balance of Bob ', micaCoin.getBalanceOfAddress(barWalletAddress))

// console.log(JSON.stringify(micaCoin, null, 4))