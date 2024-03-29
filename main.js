const {Blockchain, Block,Transaction} = require('./blockchain4.js')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const barKey = ec.keyFromPrivate('4a8c9b48ffb71cae5f8663074b4a7d32a1ed50b4f16b9e12520f96ce4f4b7d22')
const barWalletAddress = barKey.getPublic('hex')

const yanivKey = ec.keyFromPrivate('cf7d0b4494d1344a2ea789e548cd3d94ca4a515dc07b91f579a252eb7bcb0093')
const yanivWalletAddress = yanivKey.getPublic('hex')

const minerKey = ec.keyFromPrivate(' 35c6745760526113b88210ad543fbd9422dd4d9f2b646fda22ed6c4a87060e12')
const minerWalletAddress = minerKey.getPublic('hex')

let micaCoin = new Blockchain()
//miner get 200 coins //starts from  block 2 because the first is genesis
for (let i = 0; i < 10; i++)
    micaCoin.minePendingTransactions(minerWalletAddress)

//send to 2 wallet 100 each
const tx1 = new Transaction(minerWalletAddress, yanivWalletAddress, 100, 0)
tx1.signTransaction(minerKey)
micaCoin.addTransaction(tx1)

const tx2 = new Transaction(minerWalletAddress, barWalletAddress, 100, 0)
tx2.signTransaction(minerKey)
micaCoin.addTransaction(tx2)
micaCoin.minePendingTransactions(minerWalletAddress)


for (let i = 0; i < 30; i++) {
    let tx3 = new Transaction(yanivWalletAddress, barWalletAddress, 5, 2)
    tx3.signTransaction(yanivKey)
    micaCoin.addTransaction(tx3)
    let tx4 = new Transaction(barWalletAddress, yanivWalletAddress, 10, 1)
    tx4.signTransaction(barKey)
    micaCoin.addTransaction(tx4)
    micaCoin.minePendingTransactions(minerWalletAddress)
}

// while (micaCoin.pendingTransactions.length > 0){ wont work
//     micaCoin.minePendingTransactions(minerWalletAddress)
// }


console.log("Coin Capacity: " + micaCoin.coinCapacity)
console.log("Total Burned: " + micaCoin.totalBurned)
console.log("Total Supply: " + micaCoin.totalSupply)
console.log("Total mined: " + micaCoin.totalMined)
console.log('Balance of miner: ', micaCoin.getBalanceOfAddress(minerWalletAddress))
console.log('Balance of bar: ', micaCoin.getBalanceOfAddress(barWalletAddress))
console.log('Balance of yaniv: ', micaCoin.getBalanceOfAddress(yanivWalletAddress))



//Running minded transaction SPV demo
let spvDemo = new Transaction(barWalletAddress, yanivWalletAddress, 5, 1)
spvDemo.signTransaction(barKey)
micaCoin.addTransaction(spvDemo)
micaCoin.minePendingTransactions(minerWalletAddress)
micaCoin.transactionLookupInTheBlockchainBloomFilter(spvDemo)//Transaction is the minded

//Running SPV demo on a transaction that has been mining yet
let spvDemo2 = new Transaction(yanivWalletAddress, barWalletAddress, 30, 1)
spvDemo2.signTransaction(yanivKey)
micaCoin.addTransaction(spvDemo2)
micaCoin.transactionLookupInTheBlockchainBloomFilter(spvDemo2)

//Running SPV demo on a transaction that is not instance of Transaction
micaCoin.transactionLookupInTheBlockchainBloomFilter('tx1')

//Running demo of transaction with  out sufficient funds in the wallet
let overDraftTransactionDEmo = new Transaction(barWalletAddress, yanivWalletAddress, 1000, 1)
overDraftTransactionDEmo.signTransaction(barKey)
micaCoin.addTransaction(overDraftTransactionDEmo)
micaCoin.minePendingTransactions(minerWalletAddress)

