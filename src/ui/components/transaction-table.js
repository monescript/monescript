var accountNameHelper = require('../util/account-name-helper');
var balanceFilterHelper = require('../util/balance-filter-helper');
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
        return balanceFilterHelper.transactionMatchesFilter(t, this.filter);
      });
      if(this.transactions == null){
        this.transactions = [];
      }
    },

    matchingPostings: function(t){
      return balanceFilterHelper.matchingPostings(t, this.filter);
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
      return balanceFilterHelper.getWeekNumber(txnDate).week;
    },
  }
});
