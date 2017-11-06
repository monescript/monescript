var Vue = require('vue');

module.exports = Vue.component('account-filter', {
  template: '#account-filter-template',
  data: function(){
    let today = new Date();
    let todayMonth = today.getMonth() + 1;

    return {
      filter: {
        account: 'Expenses',
        month: todayMonth
      }
    };
  },
  methods: {
    updateFilter: function(){
      this.$emit('input', this.filter);
    }
  }
});