var Big = require('big.js');

var Journal = {
  reset: function(){
    this.bucketAccount = {};
    this.accounts = {};
  },

  add: function(entry){

    switch(entry.type)
    {
      case 'bucket':
        this.bucket(entry);
        break;

      case 'transaction':
        this.transaction(entry);
        break;
    }

    return this;
  },

  balance: function(){
    return this.accounts;
  },

  //----------- Internal state

  bucketAccount: {},
  accounts: {},

  //----------- Internal methods

  bucket: function(entry){
    this.bucketAccount = entry.account;
    var accountName = this.encodeAccountName(entry.account);
    if(this.accounts[accountName] == null)
    {
      this.accounts[accountName] = {
        account: entry.account,
        currency: '$',
        balance: Big(0),
      }
    }
  },

  encodeAccountName: function(accountArray){
    return accountArray.join(':');
  },

  transaction: function(txn){
    var journal = this;

    this.validateTransaction(txn);

    txn.posting.forEach(function(p) {
      var accountName = p.account.join(':');
      var postingAmount = journal.amount(p);
      if(journal.accounts[accountName] == null){
        journal.accounts[accountName] = {
          account: p.account,
          currency: p.currency,
          balance: postingAmount,
        }
      } else {
        var accountBalance = journal.accounts[accountName].balance;
        journal.accounts[accountName].balance = accountBalance.add(postingAmount);
      }
    });

    var totalSum = this.transactionBalance(txn);
    if(!totalSum.eq(Big(0))){
      this.balanceWithBucketAccount(totalSum);
    }
  },

  balanceWithBucketAccount: function(totalSum){
      var bucketAccountName = this.encodeAccountName(this.bucketAccount);
      var bucketAccountBalance = this.accounts[bucketAccountName].balance;
      this.accounts[bucketAccountName].balance = bucketAccountBalance.minus(totalSum);
  },

  transactionBalance: function(txn){
    var journal = this;
    var totalSum = Big(0);
    txn.posting.forEach(function(p) {
      totalSum = totalSum.add(journal.amount(p));
    });
    return totalSum;
  },

  validateTransaction: function(txn){
    var totalSum = this.transactionBalance(txn);

    if(txn.posting.length == 1 && this.bucketAccount.length > 0 ){
      return;
    }

    if(!totalSum.eq(Big(0))){
      var error = new Error('Transaction is not balanced');
      error.txn = txn;
      throw error;
    }
  },

  amount: function(p){
    return Big(p.amount);
  }
}

module.exports = Journal;