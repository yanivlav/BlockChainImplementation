<h1 align="center">BlockChain Implementation</h1>

***

## ℹ️ Overview
A simple blockchain implements MerkelTree and Bloomfilter written in node.js

Simple output of miner:
![image](https://user-images.githubusercontent.com/22189126/179813496-e5a539ef-3d45-42e6-aaf8-05adf69d95cd.png)


***For Begginers***: Go trough Step 0-4 for better understanding.
Make sure that you are fimiliar with all concepts in stage before moving on to the next one.
Eech lesson folder contains two files main[x].js and blockchain[x].js where x is lesson's number (main[x] is used for our testings).

***Lesson0***
- Simple blockchain: Block and BlockChain classes

***Lesson1***
- Adding the isChainValid() to BlockChain

***Lesson2***
- Adding to mineBlock() to Block

***Lesson3***
- Adding Transaction Class
- Removing addBlock() from Block
- Adding minePendingTransactions(miningRewardAddress), getBalanceOfAddress(address), createTransaction(transaction) in BlockChain

***Lesson4***
- Changing createTransaction(transaction) to addTransaction(transaction) in BlockChain
- Add hasValidTransaction() to Block
- Before moving on:
***Read about Bloomfilter and MerkleTree that we are going to use in our blockchain and go check the folder "Components Examples" for better understanding (Lesson4/"Trying to implement MerkelTree" folder has some examples too).***
 
## ℹ️ Now go checkout blockchain4.js and test file main.js in the root directory.

### ✍️ Authors
💿 https://github.com/yanivlav 
💿 https://github.com/BarDAP
