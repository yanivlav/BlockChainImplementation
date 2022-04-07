const SHA256 = require('crypto-js/sha256')



class Block {

    /**
     * @param {number} timestamp
     * @param {Transaction[]} transactions
     * @param {string} previousHash
     */
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash
        this.timestamp = timestamp
        this.transactions = transactions
        this.hash = this.calculateHash()
        this.nonce = 0


        const leaves = transactions.map(x => SHA256(x)) // x.hash?
        this.tree = new MerkleTree(leaves, SHA256)
        this.root = tree.getRoot().toString('hex')
        /*
          ////Add a new transaction as leaf
            // leaf = SHA256('a') 

          ////Get proof a leaf in tree
            // proof = tree.getProof(leaf)

          ////Verifying leaf in tree
            // console.log(tree.verify(proof, leaf, root)) // true

            // const badLeaves = ['a', 'x', 'c'].map(x => SHA256(x))
            // const badTree = new MerkleTree(badLeaves, SHA256)
            // const badLeaf = SHA256('x')
            // const badProof = tree.getProof(badLeaf)
            // console.log(tree.verify(badProof, leaf, root)) // false
          */
    }

    /**
     * Returns the SHA256 of this block (by processing all the data stored
     * inside this block)
     *
     * @returns {string}
     */
    calculateHash() {
        /*
          const leaves = transactions.map(x => SHA256(x))
          this.tree = new MerkleTree(leaves, SHA256)
          this.root = tree.getRoot().toString('hex')
        */
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString()
    }

    /**
     * Starts the mining process on the block. It changes the 'nonce' until the hash
     * of the block starts with enough zeros (= difficulty)
     *
     * @param {number} difficulty
     */
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++
            this.hash = this.calculateHash()

        }

        console.log('Block minded  ' + this.nonce)
    }

    /**
     * Validates all the transactions inside this block (signature + hash) and
     * returns true if everything checks out. False if the block is invalid.
     *
     * @returns {boolean}
     */
    hasValidTransaction() {
        for (const tx of this.transactions) { // < 
            if (!tx.isValid()) {
                return false
            }

        }
        return true
    }

} //Block
