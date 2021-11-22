const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transaction for other wallet!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(!this.toAddress) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(transactions){
        this.prevHash = '';
        this.transactions = transactions;
        this.timeStamp = new Date();

        this.hash = this.calculateHash();
        this.mineVar = 0;
    }

    calculateHash(){
        return SHA256(this.prevHash + JSON.stringify(this.data) + this.timeStamp + this.mineVar).toString();
    }

    mineBlock(difficulty){
        while(!this.hash.startsWith('0'.repeat(difficulty))){
            this.mineVar++;
            this.hash = this.calculateHash();
        }
    }

    hasValidTransaction(){
        for(trans of this.transactions){
            if(!trans.isValid()) return false;
        }

        return true;
    }
}

class Blockchain{
    constructor(difficulty){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = difficulty;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block('', 'taiht blockchain');
    }

    getLastestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){        
        newBlock.prevHash = this.getLastestBlock().hash;
        console.log('start mining');
        console.time('mine');
        newBlock.mineBlock(this.difficulty);
        console.timeEnd('mine');
        console.log('end mining', newBlock);
        
        this.chain.push(newBlock);
    }

    miniPendingTransactions(miningRewardAddress){
        let block = new Block(this.pendingTransactions);
        block.mineBlock();

        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }

        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount
                }
            }
        }

        return balance;
    }

    isValidChain(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if(!currentBlock.hasValidTransaction()) return false;
            if(currentBlock.hash !== currentBlock.calculateHash()) return false;
            if(currentBlock.prevHash !== previousBlock.hash) return false;
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;