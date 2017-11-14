var accountNameHelper = require('../util/account-name-helper');
var balanceTreeHelper = require('../util/balance-filter-helper');
var Big = require('big.js');

var Vue = require('vue');

module.exports = Vue.component('transaction-table', {
  template: '#transaction-table-template',
  props: ['filter', 'journal'],
  data: function(){
    return {
      transactions: []
    };
  },
  beforeMount: function(){
      this.updateTransactions();
  },
  watch: {
    filter: {
      handler:function (){
        this.updateTransactions();
      },
      deep: true
    },
    journal: {
      handler:function (){
        this.updateTransactions();
      },
      deep: true
    },
  },
  methods: {
    updateTransactions: function(){
      this.transactions = this.journal.transactions(t => {
        if(t.type == 'transaction' && t.date.month == this.filter.month){
          if(this.hasMatchingPosting(t) != null)
            return true;
        }
        return false;
      });
      if(this.transactions == null){
        this.transactions = [];
      }
    },

    hasMatchingPosting: function(t){
      for(let i = 0; i < t.posting.length; ++i){
        if(t.posting[i].account != null && accountNameHelper.accountMatches(t.posting[i].account, this.filter.account)  &&
          t.posting[i].amount != null){
            return t.posting[i];
        }
      }
      return null;
    },

    matchingPostings: function(t){
      let matches = [];
      for(let i = 0; i < t.posting.length; ++i){
        if(t.posting[i].account != null && accountNameHelper.accountMatches(t.posting[i].account, this.filter.account)  &&
          t.posting[i].amount != null){
            matches.push(t.posting[i]);
        }
      }

      return matches;
    },

    matchingPostingsTotal: function(t){
      let total = new Big(0.0);
      let matches = this.matchingPostings(t);
      for(let i = 0; i < matches.length; ++i){
        total = total.add(matches[i].amount);
      }
      return this.formattedAmount(total);
    },

    formattedAmount: function(v){
      let value = v == null || v.toFixed == null ? 0.00 : v.toFixed(2);
      return parseFloat(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
    },

    formattedAccount: function(account){
      return accountNameHelper.encodeAccountName(account);
    },

    txnWeekNumber: function(t){
      let txnDate = new Date(t.date.year, t.date.month - 1, t.date.day)
      return balanceTreeHelper.getWeekNumber(txnDate).week;
    },
  }
});
