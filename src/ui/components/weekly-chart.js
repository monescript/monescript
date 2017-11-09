var Vue = require('vue');
var c3 = require('c3');

module.exports = Vue.component('weekly-chart', {
  template: '#chart-template',
  props: ['columnData'],
  data: function(){
    return {};
  },

  watch: {
    columnData: function () {
      var self = this;
      Vue.nextTick(function () {
        self.createChart()
      });
    }
  },
  methods: {
    uniqId: function(){
      return 'monthly-chart-' + this._uid;
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
  beforeMount: function(){
      var self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
  },
});