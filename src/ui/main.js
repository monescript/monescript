var parser = require('../../src/parser/journal-parser.js');
var journal = require('../../src/journal.js');
var balancer = require('../../src/balance');
var Big = require('big.js');

var Vue = require('vue');
require('./components/accounts.js');

var app = new Vue({
  el: '#app',
  data: {
    filter: 'Expenses',
    accounts: [],
    accountTree: [
      {
        name: 'Expenses',
        balance: 345.67,
        accounts: [
          {
            name: 'Bills',
            balance: 123.45
          }
        ]
      },
      {
        name: 'Income',
        balance: -567.89,
        accounts: [
          {
            name: 'Salary',
            balance: -123.45
          }
        ]
      }
    ]
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

        //document.getElementById('data').value = text;

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
        var balance = "";

        let self = this;
        self.accounts = [];

        var b = balancer.balance(journal, t => t.date.month == 10);

        var b2 = Object.keys(b)
        .filter(a => a.toLowerCase().indexOf(this.filter.toLowerCase()) >= 0)
        .sort((a, b) => a.localeCompare(b)).map(a => b[a]);

        var offset = 18;
        b2.forEach(function(a) {
            var account = a.account;
            var name = account[account.length - 1];
            for(var i = 0; i < account.length - 1; ++i)
              name = '  ' + name;
            var value = a.currency + a.balance.toFixed(2) + '';

            if(value.length < offset){
              for(var j = value.length; j < offset; ++j){
                value = value + ' ';
              }
            }

            self.accounts.push(value + name + "\n")
        });
    }
  },
  beforeMount(){
      this.createJournal(document.getElementById('data').value);
  },
})

