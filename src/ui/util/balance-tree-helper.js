var accountNameHelper = require('./account-name-helper');
var balancer = require('../../../src/balance');
let Big = require('big.js');

module.exports = {

  filteredBalanceTree: function(journal, filter){


    let postingAccountFilter =
        filter != null && filter.accountRegex != null ?
          p => p.account != null &&
          p.account.some(a => a.toLowerCase().indexOf(filter.accountRegex.toLowerCase()) >= 0)
          :
          p => true;

    let txnMonthFilter =
        filter != null && filter.month != null  ?
        t => t.date.month == filter.month
        :
        t => true;


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
};