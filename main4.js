const {Blockchain,Block,Transaction}=require('./blockchain4.js')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const barKey = ec.keyFromPrivate('de0a8883f0a62ab59763203d50e3382ed6079902ba2367387fcd1b59a6eb06ec')
const yanivKey = ec.keyFromPrivate('cf7d0b4494d1344a2ea789e548cd3d94ca4a515dc07b91f579a252eb7bcb0093')
const minerKey = ec.keyFromPrivate('35c6745760526113b88210ad543fbd9422dd4d9f2b646fda22ed6c4a87060e12')

const barWalletAddress = barKey.getPublic('hex')
const yanivWalletAddress = yanivKey.getPublic('hex')
const minerWalletAddress = minerKey.getPublic('hex')

let minerCoin = new Blockchain()

const tx1 = new Transaction(minerWalletAddress, yanivWalletAddress, 10)
tx1.signTransaction(minerKey)
minerCoin.addTransaction(tx1)
minerCoin.minePendingTransactions(minerWalletAddress)

const tx2 = new Transaction(yanivWalletAddress, barWalletAddress, 5)
tx1.signTransaction(yanivKey)
minerCoin.addTransaction(tx2)
minerCoin.minePendingTransactions(minerWalletAddress)


console.log('\ Balance of Bob ', minerCoin.getBalanceOfAddress(barWalletAddress))
console.log('\ Balance of Bob ', minerCoin.getBalanceOfAddress(yanivWalletAddress))
console.log('\ Balance of Bob ', minerCoin.getBalanceOfAddress(minerWalletAddress))

console.log(JSON.stringify(minerCoin, null, 4))