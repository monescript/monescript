var Vue = require('vue');
var c3 = require('c3');

module.exports = Vue.component('monthly-chart', {
  template: '#monthly-chart-template',
  props: ['columnData'],
  data: function(){
    let today = new Date();
    let todayMonth = today.getMonth() + 1;

    return {
      id: '',
      style: ''
    };
  },
  watch: {
    columnData: function (newQuestion) {
      var self = this;
      Vue.nextTick(function () {
        self.createChart()
      });
    }
  },
  methods: {

    createChart: function(){
      console.log(this.id);
      console.log(JSON.stringify(this.columnData, null, 2));
      var chart = c3.generate({
          bindto: this.id,
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