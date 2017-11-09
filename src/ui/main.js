var parser = require('../../src/parser/journal-parser');
var journal = require('../../src/journal');
var balancer = require('../../src/balance');
var Big = require('big.js');
var sampleGenerator = require('../../generator/generator.util');
var accountNameHelper = require('./util/account-name-helper');
var balanceTreeHelper = require('./util/balance-filter-helper');

var Vue = require('vue');
require('./components/accounts.js');
require('./components/account-filter.js');
require('./components/monthly-chart.js');
require('./components/weekly-chart.js');

var app = new Vue({
  el: '#app',
  data: {
    filter:  {
      account: 'Expenses',
      month: new Date().getMonth() + 1
    },
    accountTree: {},
    transactions: [],
    totalInOutData: [],
    filteredData: [],
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

    updateTransactions: function(){
      this.transactions = journal.transactions(t => {
        if(t.type == 'transaction' && t.date.month == this.filter.month){
          if(this.matchingPosting(t) != null)
            return true;
        }
        return false;
      });
      if(this.transactions == null){
        this.transactions = [];
      }
    },

    matchingPosting: function(t){
      for(let i = 0; i < t.posting.length; ++i){
        if(t.posting[i].account != null && accountNameHelper.encodeAccountName(t.posting[i].account).toLowerCase().indexOf(this.filter.account.toLowerCase()) >= 0 &&
          t.posting[i].amount != null){
            return t.posting[i];
        }
      }
      return null;
    },

    matchingTxnPosting: function(t){
      let mp = this.matchingPosting(t);
      return mp == null ? {amount: 0.0, account: []} : mp;
    },

    updateAccounts: function(){
      this.accountTree = balanceTreeHelper.filteredBalanceTree(journal, this.filter);
      if(this.accountTree == null){
        this.accountTree = {};
      }
    },

    calculateBalance: function(){
      this.updateTransactions();
      this.updateAccounts();
      this.createCharts();
    },

    generateJournal: function(){
      const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let today = new Date();
      let todayMonth = today.getMonth() + 1;
      let todayDay = today.getDate();
      let todayYear = today.getFullYear();

      let text = '';
      for(let month = 0; month < todayMonth; ++month){
        for(let day = 1; day <= monthDays[month]; day++){
          if(month == todayMonth && day > todayDay){
            break;
          }
          text += sampleGenerator.transactionsDay(todayYear, month + 1, day);
        }
      }
      return text;
    },

    getMonthlyBalance: function(account, month){
      return balanceTreeHelper.filteredBalance(journal, {
        account: account,
        month: month
      });
    },

    txnWeekNumber: function(t){
      let txnDate = new Date(t.date.year, t.date.month - 1, t.date.day)
      return balanceTreeHelper.getWeekNumber(txnDate);
    },

    createCharts : function(){
        this.createChart();
        this.createChartFiltered();
        this.createChartWeeklyFiltered();
    },

    createChartWeeklyFiltered: function(){
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

    createChartFiltered: function(){
      let data = [this.filter.account];
      for(let i = 1; i <= 12; ++i){
        data.push(this.getMonthlyBalance(this.filter.account, i));
      }
      this.filteredData = [data];
    },

    createChart: function(){
      let dataExpense = ['Expense'];
      let dataIncome = ['Income'];
      for(let i = 1; i <= 12; ++i){
        dataExpense.push(this.getMonthlyBalance('Expense', i));
        dataIncome.push(this.getMonthlyBalance('Income', i));
      }
      this.totalInOutData = [dataExpense, dataIncome];
    }
  },

  beforeMount: function(){
      var self = this;
      var text = this.generateJournal();
      this.createJournal(text);
      this.calculateBalance();
  },
})

