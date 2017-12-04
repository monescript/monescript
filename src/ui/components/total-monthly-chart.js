var Vue = require('vue');
var c3 = require('c3');

var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');

module.exports = Vue.component('total-monthly-chart', {
  template: '#total-monthly-chart-template',
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
  computed: {
    totalIncome: function(){
      return formatHelper.formattedAmount(balanceFilterHelper.totalBalance(this.journal, 'Income:'));
    },
    totalExpenses: function(){
      return formatHelper.formattedAmount(balanceFilterHelper.totalBalance(this.journal, 'Expenses:'));
    },
    averageMonthlyIncome: function(){
      return formatHelper.formattedAmount(balanceFilterHelper.totalBalance(this.journal, 'Income:') / this.monthCount);
    },
    averageMonthlyExpenses: function(){
      return formatHelper.formattedAmount(balanceFilterHelper.totalBalance(this.journal, 'Expenses:')  / this.monthCount);
    },

  },
  methods: {
    uniqId: function(){
      return 'monthly-chart-' + this._uid;
    },

    getMonthlyBalance: function(account, month){
      return balanceFilterHelper.filteredMonthlyBalance(this.journal, {
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
      this.monthCount = this.journal.getTransactionMonthCount();

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
