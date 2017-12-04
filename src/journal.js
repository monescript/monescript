var Big = require('big.js');
var _ = require('underscore');
var eval = require('./expression-evaluator.js');

var Journal = {
  reset: function(){
    this.bucketAccount = [];
    this.transactionList = [];

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

  transactions: function(filter){
    if(filter == null)
      filter = a => true;
    return this.transactionList.filter(filter);
  },

  getTransactionMonthCount: function(){
      var allMonths = this.transactionList.map(t => t.date.month);
      var months = Array.from(new Set(allMonths));
      return months.length;
  },

  //----------- Internal state

  transactionList: [],
  bucketAccount: [],

  //----------- Internal methods

  bucket: function(entry){
    this.bucketAccount = entry.account;
  },

  transaction: function(txnArgument){
    var txn = this.copy(txnArgument);

    var journal = this;
    this.validateTransaction(txn);
    var currency;

    this.postings(txn).forEach(function(p) {
      var postingAmount = journal.amount(p);

      var postingCurrency = journal.currency(p);
      if(postingCurrency != null){
        currency = postingCurrency;
      }
    });

    var totalSum = this.transactionBalance(txn);

    if(!totalSum.eq(Big(0))){
      if(this.hasOnePostingWithoutAmount(txn)){
        this.assignBalancingAmount(txn, currency, totalSum);
      }else{
        this.createMissingPostingFromBucketAccount(txn, currency, totalSum);
      }
    }

    this.transactionList.push(txn)
  },

  copy : function(txn){
    return JSON.parse(JSON.stringify(txn));
  },

  assignBalancingAmount: function(txn, currency, remainder){
      var emptyAmountPosting = this.postings(txn).filter(p => p.emptyInitialAmount)[0];
      emptyAmountPosting.currency = currency;
      emptyAmountPosting.amount = remainder.times(-1.0);
  },

  createMissingPostingFromBucketAccount: function(txn, currency, remainder){
      txn.posting.push(
        {account: _.clone(this.bucketAccount), currency: currency, amount: remainder.times(-1.0)}
      );
  },

  transactionBalance: function(txn){
    var journal = this;
    var totalSum = Big(0);
    this.postings(txn).forEach(function(p) {
      var pAmt = journal.amount(p);
      totalSum = totalSum.add(pAmt);
    });
    return totalSum;
  },

  validateTransaction: function(txn){
    var totalSum = this.transactionBalance(txn);

    if(this.postings(txn).length == 1 && this.bucketAccount.length > 0 )
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
    this.postings(txn).forEach(function(p) {
      if(p.emptyInitialAmount)
        noAmountPostings++;
    });

    return this.postings(txn).length > 1 && noAmountPostings == 1;
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
      p.emptyInitialAmount = true;
      p.amount = Big(0);
    } else if(p.amount.type == 'BinaryExpression' ){
      p.amountExpression = p.amount;
      var result = eval.evaluate(p.amountExpression);
      p.amount = result.amount;
      p.currency = result.currency;
    } else if(!(p.amount instanceof Big)){
      p.amount = Big(p.amount);
    }
    return p.amount;
  },

  postings: function(txn){
    return txn.posting.filter(function(p){
      return p.account != null;
    });
  }
}

module.exports = Journal;