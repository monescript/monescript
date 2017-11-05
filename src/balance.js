var Big = require('big.js');
var eval = require('./journal.js');
var _ = require('underscore');

var Balance = {

  balance: function(journal, txnFilter, postingFilter){
    this.reset();
    this.processBucketAccount(journal);
    var balancer = this;

    if(txnFilter == null){
      txnFilter = t => true;
    }

    if(postingFilter == null){
      postingFilter = p => true;
    }

    journal.transactionList.filter(txnFilter).forEach(t => balancer.processTransaction(journal, t, postingFilter));

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

    var accountHierarchy = this.produceAccountHierarchy(journal.bucketAccount);

    accountHierarchy.forEach(a => {
      var accountName = this.encodeAccountName(a);
      if(this.accounts[accountName] == null)
      {
        this.accounts[accountName] = {
          account: a,
          currency: '$',
          balance: Big(0),
        }
      }
    });
  },

  encodeAccountName: function(accountArray){
    return accountArray.join(':');
  },

  produceAccountHierarchy: function(accountArray){
    var accountHierarchy = [];
    var lastAccount = [];
    accountArray.forEach(a => {
      lastAccount.push(a);
      accountHierarchy.push(_.clone(lastAccount));
    })
    return accountHierarchy;
  },

  processTransaction: function(journal, txn, postingFilter){
    var balancer = this;

    this.postings(txn, postingFilter).forEach(function(p) {
      var postingAmount = p.amount;
      var postingCurrency = journal.currency(p);
      if(p.amount != null){
          var accountHierarchy = balancer.produceAccountHierarchy(p.account);
          accountHierarchy.forEach(account => balancer.balanceWithAccount(postingAmount, postingCurrency, account));
      }
    });
  },

  postings: function(txn, postingFilter){
    return txn.posting.filter(function(p){
      return p.account != null && postingFilter(p);
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
  },
}

module.exports = Balance;