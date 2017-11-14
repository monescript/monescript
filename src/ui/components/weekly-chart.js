var Vue = require('vue');
var c3 = require('c3');
var balanceFilterHelper = require('../util/balance-filter-helper');

module.exports = Vue.component('weekly-chart', {
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
        data.push(this.getWeeklyBalance(i));
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
                  categories: catIds
              }
          }
      });
    }
  },
});
