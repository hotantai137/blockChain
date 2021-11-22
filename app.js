const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('2a27b3ea16ee4e7fca0aec6164de036f52064d7add2a5fb82b0bf3cdb631fc74');
const myWalletAddress = myKey.getPublic('hex');

let taihtBlockChain = new Blockchain(4);

const trans1 = new Transaction(myWalletAddress, 'public key goes here', 10);
trans1.signTransaction(myKey);
taihtBlockChain.addTransaction(trans1);

// taihtBlockChain.createTransaction(new Transaction('address1', 'address2', 100));
// taihtBlockChain.createTransaction(new Transaction('address2', 'address1', 50));
console.log('\n Starting the miner...');
taihtBlockChain.miniPendingTransactions(myWalletAddress);
// console.log('\n Balance of address1 is ', taihtBlockChain.getBalanceOfAddress('address1'));
// console.log('\n Balance of address2 is ', taihtBlockChain.getBalanceOfAddress('address2'));
// taihtBlockChain.miniPendingTransactions('taiht-address');
console.log('\n Balance of taiht is ', taihtBlockChain.getBalanceOfAddress(myWalletAddress));