var accountNameHelper = require('./account-name-helper');
var balancer = require('../../../src/balance');
let Big = require('big.js');

module.exports = {

  filteredBalanceTree: function(journal, filter){
    let accountArray = getFilteredAccountArray(journal, filter, createMonthFilter(filter));
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
          var fullAccountPath = a.account.slice();
          var nextLevel = {name: n, fullName: accountNameHelper.encodeAccountName(fullAccountPath)};
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

  filteredMonthlyBalance: function(journal, filter){
    return filteredBalance(journal, filter, createMonthFilter(filter));
  },

  filteredWeeklyBalance: function(journal, filter){
    return filteredBalance(journal, filter, createWeekFilter(filter));
  },

  getWeekNumber : function(date) {
    return weekNumberFromDate(date);
  },

  transactionMatchesFilter: function(t, filter){
      return isTransactionMatchingTheFilter(t, filter, createMonthFilter(filter));
  },

  matchingPostings: function(t, filter){
    let postingAccountFilter = createPostingAccountFilter(filter);
    return t.posting.filter(p => postingAccountFilter(p));
  },

  totalBalance: function(journal, account){
    return Math.abs(filteredBalance(journal, {account: account}, (t)=> true));
  }
};

function isTransactionMatchingTheFilter(t, filter, txnDateFilter){
    let txnPayeeFilter = createPayeeFilter(filter);
    let postingAccountFilter = createPostingAccountFilter(filter);
    return txnDateFilter(t) && txnPayeeFilter(t) && t.posting.some(postingAccountFilter);
}

function getFilteredAccountArray(journal, filter, txnFilter){
    let postingAccountFilter = createPostingAccountFilter(filter);

    let filteredAccounts = balancer.balance(journal,
                                            t => isTransactionMatchingTheFilter(t, filter, txnFilter),
                                            postingAccountFilter)

    return Object.keys(filteredAccounts)
      .map(a => filteredAccounts[a]);
}

function filteredBalance(journal, filter, txnFilter){
  let accountArray = getFilteredAccountArray(journal, filter, txnFilter);
  let topAccounts = findTopAccounts(accountArray);
  return accountsTotal(topAccounts);
}

function findTopAccounts(accounts){
  return accounts.filter(a => a.account.length == 1);
}

function accountsTotal(accounts){
  let sum = accounts.reduce((a, b) => {
    return {balance: a.balance.plus(b.balance)};
  }, {balance: Big(0)});

  return parseFloat(sum.balance.toFixed(2));
}

function createPostingAccountFilter(filter){
    var a =
        filter != null && filter.account != null ?
          p => p.account != null &&
          accountNameHelper.accountMatches(p.account, filter.account)
          :
          p => true;
    return a;
}

function createPayeeFilter(filter){
    var a =
        filter != null && filter.payee != null && filter.payee != '' ?
        t => t.payee.toLowerCase().indexOf(filter.payee.toLowerCase()) >= 0
        :
        t => true;

    return a;
}

function createMonthFilter(filter){
    var a =
        filter != null && filter.month != null && filter.month > 0 ?
        t => t.date.month == filter.month
        :
        t => true;

    return a;
}

function createWeekFilter(filter){
    var a =
        filter != null && filter.week != null  ?
        t => {
          let txnDate = new Date(t.date.year, t.date.month - 1, t.date.day)
          return weekNumberFromDate(txnDate).week == filter.week
        }
        :
        t => true;

    return a;
}

/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
function weekNumberFromDate(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return {year: d.getUTCFullYear(), week: weekNo};
}
