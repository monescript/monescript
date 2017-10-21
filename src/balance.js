var Big = require('big.js');
var eval = require('./journal.js');

var Balance = {

  balance: function(journal, txnFilter){
    this.reset();
    this.processBucketAccount(journal);
    var balancer = this;

    if(txnFilter == null){
      txnFilter = t => true;
    }

    journal.transactionList.filter(txnFilter).forEach(t => balancer.processTransaction(journal, t));

    return this.accounts;
  },

  //----------- Internal state

  accounts: {},

  //----------- Internal methods

  reset: function(){
    this.accounts = {};
  },

  processBucketAccount: function(journal){
    if(journal.bucketAccount.length == 0)
      return;

    var accountName = this.encodeAccountName(journal.bucketAccount);
    if(this.accounts[accountName] == null)
    {
      this.accounts[accountName] = {
        account: journal.bucketAccount,
        currency: '$',
        balance: Big(0),
      }
    }
  },

  encodeAccountName: function(accountArray){
    return accountArray.join(':');
  },

  processTransaction: function(journal, txn){
    var balancer = this;
    this.postings(txn).forEach(function(p) {
      var postingAmount = p.amount;
      var postingCurrency = journal.currency(p);
      if(p.amount != null){
        balancer.balanceWithAccount(postingAmount, postingCurrency, p.account);
        currency = postingCurrency;
      }
    });
  },

  postings: function(txn){
    return txn.posting.filter(function(p){
      return p.account != null;
    });
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
//    console.log(accountName + ":" +  this.accounts[accountName].balance + "; amt: " + amount);
  },



}

module.exports = Balance;