var Vue = require('vue');
var balanceTreeHelper = require('../util/balance-filter-helper');


module.exports = Vue.component('accounts', {
  template: '#accounts-template',
  props: ['filter', 'journal', 'accounts'],
  data: function(){
    return {
      accountTree : {}
    };
  },
  beforeMount: function(){
      this.updateAccounts();
  },
  watch: {
    filter: {
      handler:function (){
        this.updateAccounts();
      },
      deep: true
    },
    journal: {
      handler:function (){
        this.updateAccounts();
      },
      deep: true
    },
  },
  methods: {
    updateAccounts: function(){
      if(this.journal == null){
        this.accountTree = this.accounts;
        return;
      }
      this.accountTree = balanceTreeHelper.filteredBalanceTree(this.journal, this.filter);
      if(this.accountTree == null){
        this.accountTree = {};
      }
    },

    level: function(){
      return this.accountTree;
    },

    accountDisplay: function(value){
      return `${value.balance == null ? '' : value.balance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })} ${value.name }`;
    }
  }
});
