const topology = require('fully-connected-topology')
const prompt = require("prompt-sync")();
const lib = require("./main4yaniv.js");


const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
const {
    me,
    peers
} = extractPeersAndMyPort()
const sockets = {}
let fullNode = 0

log('---------------------')
log('Welcome to p2p chat!')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log('connected to peer - ', peerPort) //the other terminal

    sockets[peerPort] = socket
    stdin.on('data', data => { //on user input
        let message = data.toString().trim()
        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        if (message === 'RF') { //Run Full node
            // fullNode = me
            const { Blockchain, Block, Transaction } = require('./blockchain4.js')
            const main = require('./main4yaniv.js')
        }

        if (message === 'B') {
            // log("Your balance is: " + balance)// log print on asked terminal
            // socket.write(formatMessage("Made a Balance request\n"))
            message = "Made a Balance request\n"
        }
        if (message === 'Made a Balance request\n'){ // call micagetbalance
            socket.write(extractPeersAndMyPort())
            balanceRequestFromFullNode()

        }


        const receiverPeer = extractReceiverPeer(message)
        if (sockets[receiverPeer]) { //message to specific peer
            if (peerPort === receiverPeer) { //write only once
                sockets[receiverPeer].write(formatMessage(extractMessageToSpecificPeer(message)))
            }
        
        } else { //broadcast message to everyone
            socket.write(formatMessage(message))
        }
    })

    //print data when received
    socket.on('data', data => log(data.toString('utf8')))
})


//extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[2],
        peers: argv.slice(3, argv.length)
    }
}

//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return `127.0.0.1:${port}`
}

//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return `${me}>${message}`
}

//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.length - 4, peer.length);
}

//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}

//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}

function balanceRequestFromFullNode() {
    lib.getBalanceOfAddress('04ed93dd03e044ccaad8dcae36a2a5046b7d5c3863a445b9f187e6b83324742d04d5a84bc948e648d414c4255a88abfe96c4b98d5cf380606c912d0a24164bfa14')
    // console.log("Preforming balance requst for port: " + )
}