var Vue = require('vue');
var c3 = require('c3');
var balanceTreeHelper = require('../util/balance-filter-helper');

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

    updateChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 52; ++i){
        var b = balanceTreeHelper.filteredWeeklyBalance(this.journal, {
                      account: this.filter.account,
                      week: i
                    });
        data.push(b);
      }
      this.columnData = [data];
      let self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
    },

    createChart: function(){
      var catIds = [];
      for(var i = 1; i<=52; ++i)
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