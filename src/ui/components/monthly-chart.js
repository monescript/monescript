var Vue = require('vue');
var c3 = require('c3');

module.exports = Vue.component('monthly-chart', {
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
  },
  beforeMount: function(){
      var self = this;
      Vue.nextTick(function () {
        self.createChart();
      });
  },
});