  class Transaction{
    constructor(amount, compensation){
      this.amount = amount
      this.compensation = compensation
    }

    // compere(a,b) {return a.compensation - b.compensation;}

    
}


const tx1=new Transaction(50,2)
const tx2=new Transaction(50,10)
const tx3=new Transaction(50,0)
const tx4=new Transaction(50,0)


console.log("this is my type of ---------->" + typeof (tx1))

let trans = [tx1,tx2,tx3,tx4]
let check = []
let j=0
console.log(trans)
// trans.sort(Transaction.compere)
trans.sort((a,b) => a.compensation-b.compensation)

// console.log(trans[trans.length-1].compensation)
while(trans.length>0 && j<4 ){
    // console.log("this.pendingTransactions" + this.pendingTransactions[0].compensation)
    if(trans[trans.length-1].compensation > 0)
    check.push(trans.pop())
    else
    check.push(trans.shift())
    j++;
}

// console.log(trans)
console.log("this is check")

console.log(check)

const { PartitionedBloomFilter } = require('bloom-filters')
// create a PartitionedBloomFilter of size 10 with 5 hash functions
const filter = new PartitionedBloomFilter(10, 5)

// add some value in the filter
filter.add((tx1.amount+tx1.compensation).toString())
filter.add((tx2.amount+tx2.compensation).toString())

// lookup for some data
console.log(filter.has((tx3.amount + tx4.compensation).toString())) // output: true
console.log(filter.has('daniel')) // output: false
