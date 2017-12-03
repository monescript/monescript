var Vue = require('vue');

module.exports = Vue.component('account-filter', {
  template: '#account-filter-template',
  props: ['value']
});