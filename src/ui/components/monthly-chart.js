var Vue = require('vue');
var c3 = require('c3');

var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');

module.exports = Vue.component('monthly-chart', {
  template: '#chart-template',
  props: ['filter', 'journal', 'redraw'],
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
    redraw: {
      handler:function (){
        this.chart.flush();
      },
    }
  },
  computed: {
    total: function(){
      return formatHelper.formattedAmount(this.totalBalance());
    },
    average: function(){
      let today = new Date();
      let todayMonth = today.getMonth() + 1;
      return formatHelper.formattedAmount(this.totalBalance()/this.monthCount);
    }
  },
  methods: {
    totalBalance: function(){
      let total = 0.0;
      for(let i = 1; i <= 12; ++i){
        total += Math.abs(this.getMonthlyBalance(i));
      }
      return total;
    },

    uniqId: function(){
      return 'monthly-chart-' + this._uid;
    },

    getMonthlyBalance: function(month){
      var filterCopy = Object.assign({}, this.filter);
      filterCopy.month = month;
      return balanceFilterHelper.filteredMonthlyBalance(this.journal, filterCopy);
    },

    updateChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 12; ++i){
        data.push(Math.abs(this.getMonthlyBalance(i)));
      }
      this.columnData = [data];
      this.monthCount = this.journal.getTransactionMonthCount();
      let self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
    },

    createChart: function(){
      if(this.chart != null){
        this.chart.data(this.columnData);
      }

      this.chart = c3.generate({
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
