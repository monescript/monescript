var Vue = require('vue');
var c3 = require('c3');

var balanceTreeHelper = require('../util/balance-filter-helper');

module.exports = Vue.component('total-monthly-chart', {
  template: '#chart-template',
  props: ['journal'],
  data: function(){
    return {
      columnData: []
    };
  },
  beforeMount: function(){
      this.updateChart();
  },
  watch: {
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
      let dataExpense = ['Expense'];
      let dataIncome = ['Income'];
      for(let i = 1; i <= 12; ++i){
        dataExpense.push(Math.abs(this.getMonthlyBalance('Expense', i)));
        dataIncome.push(Math.abs(this.getMonthlyBalance('Income', i)));
      }
      this.columnData = [dataExpense, dataIncome];

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
