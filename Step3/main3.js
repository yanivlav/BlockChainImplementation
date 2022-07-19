const {Blockchain,Block,Transaction}=require('./blockchain3.js')

let micaCoin=new Blockchain()
 
micaCoin.createTransaction(new Transaction('address1','address2',100))
micaCoin.createTransaction(new Transaction('address2','Bob',50))

console.log('\n Starting mining ....')

micaCoin.minePendingTransactions('Bob')

console.log('\ Balance of Bob ',micaCoin.getBalanceOfAddress('Bob'))