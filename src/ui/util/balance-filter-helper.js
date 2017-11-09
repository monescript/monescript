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

  filteredWeeklyBalance: function(journal, filter){
    let postingAccountFilter = this.createPostingAccountFilter(filter);
    let txnFilter = this.createWeekFilter(filter);

    let filteredAccounts = balancer.balance(journal,
                              t => txnFilter(t) && t.posting.some(postingAccountFilter),
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
          filter != null && filter.account != null ?
            p => p.account != null &&
            p.account.some(a => a.toLowerCase().indexOf(filter.account.toLowerCase()) >= 0)
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
  },

  createWeekFilter: function(filter){
      var self = this;
      var a =
          filter != null && filter.week != null  ?
          t => {
            let txnDate = new Date(t.date.year, t.date.month - 1, t.date.day)
//            console.log(txnDate + ":" + self.getWeekNumber(txnDate) + "; " + filter.week);
            return self.getWeekNumber(txnDate) == filter.week
          }
          :
          t => true;

      return a;
  },

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
  getWeekNumber: function (d) {
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
//      return [d.getUTCFullYear(), weekNo];
      return weekNo;
  }

};