var Vue = require('vue');

module.exports = Vue.component('account-filter', {
  template: '#account-filter-template',
  data: function(){
    return {
      value: 'Expenses'
    };
  },
  methods: {
    updateValue: function(){
      this.$emit('input', this.value);
    }
  }
});