var parser = require('../../src/parser/journal-parser');
var journal = require('../../src/journal');
var balancer = require('../../src/balance');
var sampleGenerator = require('../../generator/generator.util');
var balanceTreeHelper = require('./util/balance-filter-helper');

var Vue = require('vue');
require('./components/accounts.js');
require('./components/account-filter.js');
require('./components/monthly-chart.js');
require('./components/weekly-chart.js');
require('./components/transaction-table.js');

var app = new Vue({
  el: '#app',
  data: {
    filter:  {
      account: 'Expenses',
      month: new Date().getMonth() + 1
    },
    journal: journal,
    accountTree: {},
    totalInOutData: [],
    filteredMonthlyData: [],
    filteredWeeklyData: []
  },
  methods: {

    handleFiles : function(e) {
        var files = e.currentTarget.files;
        var reader = new FileReader();
        var self = this;

        reader.onload = function(e) {
            var text = reader.result
            self.createJournal(text);
            self.calculateBalance();
        }
        reader.onerror = function(err) {
            console.log(err, err.loaded, err.loaded === 0);
            button.removeAttribute("disabled");
        }
        reader.readAsText(files[0]);
    },

    createJournal: function(text){
        journal.reset();

        parser.reset(text)
        var chunk;
        try{
          while((chunk = parser.next()) != null){
            journal.add(chunk);
          }
        }catch(e){
          console.log(e);
          console.log('Failing on line ' + JSON.stringify(e.chunk));
        }
    },

    calculateBalance: function(){
      this.updateAccounts();
      this.createCharts();
    },

    updateAccounts: function(){
      this.accountTree = balanceTreeHelper.filteredBalanceTree(journal, this.filter);
      if(this.accountTree == null){
        this.accountTree = {};
      }
    },

    //Charts START
    // TODO: push to components?



    getMonthlyBalance: function(account, month){
      return balanceTreeHelper.filteredMonthlyBalance(journal, {
        account: account,
        month: month
      });
    },

    createCharts : function(){
        this.createTotalsChart();
        this.createMonthlyFilteredChart();
        this.createWeeklyFilteredChart();
    },

    createWeeklyFilteredChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 52; ++i){
        var b = balanceTreeHelper.filteredWeeklyBalance(journal, {
                      account: this.filter.account,
                      week: i
                    });
        data.push(b);
      }
      this.filteredWeeklyData = [data];
    },

    createMonthlyFilteredChart: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 12; ++i){
        data.push(Math.abs(this.getMonthlyBalance(this.filter.account, i)));
      }
      this.filteredData = [data];
    },

    createTotalsChart: function(){
      let dataExpense = ['Expense'];
      let dataIncome = ['Income'];
      for(let i = 1; i <= 12; ++i){
        dataExpense.push(Math.abs(this.getMonthlyBalance('Expense', i)));
        dataIncome.push(Math.abs(this.getMonthlyBalance('Income', i)));
      }
      this.totalInOutData = [dataExpense, dataIncome];
    }

    //Charts END

  },

  beforeMount: function(){
      var self = this;
      var text = sampleGenerator.generateYearJournal();
      this.createJournal(text);
      this.calculateBalance();
  },
})

