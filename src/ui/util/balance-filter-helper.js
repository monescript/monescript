var accountNameHelper = require('./account-name-helper');
var balancer = require('../../../src/balance');
let Big = require('big.js');

module.exports = {

  filteredBalanceTree: function(journal, filter){
    let txnMonthFilter = this.createMonthFilter(filter);
    let postingAccountFilter = this.createPostingAccountFilter(filter);

    let filteredAccounts = balancer.balance(journal,
                                            t => txnMonthFilter(t) && t.posting.some(postingAccountFilter),
                                            postingAccountFilter)

    let accountArray = Object.keys(filteredAccounts)
      .map(a => filteredAccounts[a]);

    let b2 = accountArray.sort((a, b) =>
      accountNameHelper.encodeAccountName(a.account)
        .localeCompare(accountNameHelper.encodeAccountName(b.account))
    );

    let tree = {};
    b2.forEach(a => {
      let branchLevel = tree;
      a.account.forEach(n => {
        var nextLevel = branchLevel.accounts == null ? null : branchLevel.accounts[n];
        if(nextLevel == null)
        {
          var nextLevel = {name: n};
          if(branchLevel.accounts == null)
            branchLevel.accounts = {};
          branchLevel.accounts[n] = nextLevel;
        }
        branchLevel = nextLevel;
      });
      branchLevel.balance =  parseFloat(a.balance.toFixed(2));
      branchLevel.currency = a.currency;
    });

    return tree.accounts;
  },

   filteredBalance: function(journal, filter){
      let postingAccountFilter = this.createPostingAccountFilter(filter);
      let txnMonthFilter = this.createMonthFilter(filter);

      let filteredAccounts = balancer.balance(journal,
                                t => txnMonthFilter(t) && t.posting.some(postingAccountFilter),
                                postingAccountFilter)

      let accountArray = Object.keys(filteredAccounts)
        .map(a => filteredAccounts[a]);

      if(accountArray.length > 0)
      {
        var a = accountArray[0];
        return Math.abs(parseFloat(a.balance.toFixed(2)));
      }
      else
      {
        return (0.00);
      }
  },

  createPostingAccountFilter: function(filter){
      var a =
          filter != null && filter.accountRegex != null ?
            p => p.account != null &&
            p.account.some(a => a.toLowerCase().indexOf(filter.accountRegex.toLowerCase()) >= 0)
            :
            p => true;
      return a;
  },
  createMonthFilter: function(filter){
      var a =
          filter != null && filter.month != null  ?
          t => t.date.month == filter.month
          :
          t => true;

      return a;
  }
};