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

