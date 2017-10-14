var Big = require('big.js');
var eval = require('./expression-evaluator.js');

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
    var currency;
    txn.posting.forEach(function(p) {
      var postingAmount = journal.amount(p);
      var postingCurrency = journal.currency(p);
      if(p.amount != null){
        journal.balanceWithAccount(postingAmount, postingCurrency, p.account);
        currency = postingCurrency;
      }
    });

    var totalSum = this.transactionBalance(txn);

    if(!totalSum.eq(Big(0))){
      if(this.hasOnePostingWithoutAmount(txn)){
          var accountWithoutAmount;
          txn.posting.forEach(function(p) {
            if(p.amount == null)
              accountWithoutAmount = p.account;
          });
          this.balanceWithAccount(totalSum.times(-1.0), currency, accountWithoutAmount);
      }else{
        this.balanceWithBucketAccount(totalSum, currency);
      }
    }
  },

  balanceWithBucketAccount: function(totalSum, currency){
      this.balanceWithAccount(totalSum.times(-1.0), currency, this.bucketAccount);
  },

  balanceWithAccount: function(amount, currency, account){
      var accountName = this.encodeAccountName(account);

      if(this.accounts[accountName] == null){
        this.accounts[accountName] = {
          account: account,
          currency: currency,
          balance: amount,
        }
      } else {
        var accountBalance = this.accounts[accountName].balance;
        this.accounts[accountName].balance = accountBalance.add(amount);
      }
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

    if(txn.posting.length == 1 && this.bucketAccount.length > 0 )
      return;

    if(this.hasOnePostingWithoutAmount(txn))
      return;

    if(!totalSum.eq(Big(0))){
      var error = new Error('Transaction is not balanced');
      error.txn = txn;
      throw error;
    }
  },

  hasOnePostingWithoutAmount: function(txn){
    var noAmountPostings = 0;
    txn.posting.forEach(function(p) {
      if(p.amount == null)
        noAmountPostings++;
    });

    return txn.posting.length > 1 && noAmountPostings == 1;
  },

  currency: function(p){
      if( p.amount != null &&
          p.amount.evaluated != null &&
          p.amount.evaluated.currency != null){
        return p.amount.evaluated.currency;
      }

      return p.currency;
  },

  amount: function(p){
    if(p.amount == null){
      return Big(0);
    }else if(p.amount.type == 'BinaryExpression' ){
      if(p.amount.evaluated == null)
      {
        p.amount.evaluated = eval.evaluate(p.amount);
      }
      return p.amount.evaluated.amount;
    }
    return Big(p.amount);
  }
}

module.exports = Journal;