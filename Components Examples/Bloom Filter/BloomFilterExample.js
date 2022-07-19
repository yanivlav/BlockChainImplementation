const {
    PartitionedBloomFilter
} = require('bloom-filters')
// create a PartitionedBloomFilter of size 10 with 5 hash functions
const filter = new PartitionedBloomFiltr(10, 5)
// add some value in the filter
filter.add('alice')
filter.add('bob')
// lookup for some data
console.log(filter.has('bob')) // output: true
console.log(filter.has('daniel')) // output: false
