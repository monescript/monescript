var Vue = require('vue');

module.exports = Vue.component('accounts', {
  template: '#accounts-template',
  props: ['accounts'],
  data: function(){
    return {
      level: this.accounts
    };
  }
});