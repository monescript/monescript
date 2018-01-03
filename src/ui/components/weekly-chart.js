var Vue = require('vue');
var c3 = require('c3');
var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');

module.exports = Vue.component('weekly-chart', {
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
      let todayWeek = balanceFilterHelper.getWeekNumber(today).week;
      return formatHelper.formattedAmount(this.totalBalance()/todayWeek);
    }
  },
  methods: {
    totalBalance: function(){
      let total = 0.0;
      for(let i = 1; i <= 52; ++i){
        total += Math.abs(this.getWeeklyBalance(i));
      }
      return total;
    },

    uniqId: function(){
      return 'weekly-chart-' + this._uid;
    },

    getWeeklyBalance: function(week){
      var filterCopy = Object.assign({}, this.filter);
      filterCopy.month = undefined;
      filterCopy.week = week;
      return balanceFilterHelper.filteredWeeklyBalance(this.journal, filterCopy);
    },

    updateChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 52; ++i){
        data.push(Math.abs(this.getWeeklyBalance(i)));
      }
      this.columnData = [data];
      let self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
    },

    createChart: function(){
      var catIds = [];
      for(var i = 1; i <= 52; ++i)
        catIds.push(i);

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
                  categories: catIds
              }
          }
      });
    }
  },
});
