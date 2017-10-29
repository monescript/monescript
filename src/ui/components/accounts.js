var Vue = require('vue');

module.exports = Vue.component('accounts', {
  template: '#accounts-template',
  props: ['accounts'],
  data: function(){
    return {
      //level: this.accounts
    };
  },
  methods: {
    levelFn: function(){
      return this.accounts;
    },
    accountDisplay: function(value){
      return `${value.balance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })} ${value.name }`;
    }
  }
});