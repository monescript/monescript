var parser = require('../../src/parser/journal-parser');
var journal = require('../../src/journal');
var balancer = require('../../src/balance');
var Big = require('big.js');
var accountNameHelper = require('./util/account-name-helper');

var Vue = require('vue');
require('./components/accounts.js');
require('./components/account-filter.js');

var app = new Vue({
  el: '#app',
  data: {
    filter: 'Expenses',
    accountTree: {}
  },
  methods: {
    accountTreeProp: function(){
      return this.accountTree;
    },
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

        var b2 = accountNameHelper.filter(this.filter, b).sort((a, b) =>
          accountNameHelper.encodeAccountName(a.account)
            .localeCompare(accountNameHelper.encodeAccountName(b.account))
        );

        console.log(JSON.stringify(b2, null, 2));

        var offset = 18;

        this.accountTree = {};
        let tree = {}
        b2.forEach(a =>{
          let branchLevel = tree;
          a.account.forEach(n => {
            var nextLevel = branchLevel.accounts == null ? null : branchLevel.accounts[n];
            if(nextLevel == null)
            {
              var nextLevel = {name: n};
              if(branchLevel.accounts == null)
                branchLevel.accounts = {};
              branchLevel.accounts[n] = nextLevel;
            }
            branchLevel = nextLevel;
          });
          branchLevel.balance = parseFloat(a.balance.toFixed(2));
          branchLevel.currency = a.currency;
        });

        this.accountTree = tree.accounts;
        //console.log(JSON.stringify(this.accountTree, null, 2));
    }
  },
  beforeMount(){
      var text = document.getElementById('data').value;
      var lines = "";
      text.split("\n").forEach(l =>{
        var p = l.split('            ');
        lines += p[1] == undefined ? '' : p[1] + "\n";
      });
      //console.log(text);
      this.createJournal(text);
      this.calculateBalance();
  },
})

