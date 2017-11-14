var Vue = require('vue');
var c3 = require('c3');

var balanceTreeHelper = require('../util/balance-filter-helper');

module.exports = Vue.component('monthly-chart', {
  template: '#chart-template',
  props: ['filter', 'journal'],
  data: function(){
    return {
      columnData: []
    };
  },
  beforeMount: function(){
      this.updateChart();
  },
  watch: {
    filter: {
      handler:function (){
        this.updateChart();
      },
      deep: true
    },
    journal: {
      handler:function (){
        this.updateChart();
      },
      deep: true
    },
  },
  methods: {
    uniqId: function(){
      return 'monthly-chart-' + this._uid;
    },

    getMonthlyBalance: function(account, month){
      return balanceTreeHelper.filteredMonthlyBalance(this.journal, {
        account: account,
        month: month
      });
    },

    updateChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 12; ++i){
        data.push(Math.abs(this.getMonthlyBalance(this.filter.account, i)));
      }
      this.columnData = [data];
      let self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
    },

    createChart: function(){
      var chart = c3.generate({
          bindto: '#' + this.uniqId(),
          data: {
              columns: this.columnData,
              labels: true,
              type: 'bar'
          },
          bar: {
              width: {
                  ratio: 0.9
              }
          },
          axis: {
              x: {
                  type: 'category',
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              }
          }
      });
    }
  }
});
