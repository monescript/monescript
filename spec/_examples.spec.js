describe("Experiments ", function() {
  var fs = require('fs');
  var parser = require('../src/parser/journal-parser');
  var journal = require('../src/journal');
  var balancer = require('../src/balance');
  var Big = require('big.js');

  beforeEach(function() {
    journal.reset();
    var file = fs.readFileSync('file.journal', 'utf8');

    parser.reset(file)
    var chunk;
    try{
      while((chunk = parser.next()) != null){
        journal.add(chunk);
      }
    }catch(e){
      console.log(e);
      console.log('Failing on line ' + JSON.stringify(chunk));
    }
  });

  xit("print balance for one month", function() {

    var b = balancer.balance(journal, t => t.date.month == 8);

    var b2 = Object.keys(b)
    .filter(a => a.toLowerCase().indexOf('exp') >= 0)
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
        console.log(value + name);
    });
  });

  xit("print monthly balance history", function() {

    var filterAccount = 'Expenses:Purchases';

    var stats = [];

    for(var i = 1; i <= 12; ++i){
      stats.push({month: i, balance: balancer.balance(journal, t => t.date.month == i)});
    }

    var b2 = stats.map(s =>
      Object.keys(s.balance)
        .filter(a => a == filterAccount)
        .map(a => {
            return {month: s.month, balance: s.balance[a]};
        })
    );

    var offset = 18;
    b2.forEach(function(a) {
        var st = a[0];
        if(st == null) return;
        console.log(st.month + " -  balance: " + st.balance.currency + st.balance.balance.toFixed(2));
    });
  });

  xit("print txns for a month", function() {

    var filterAccount = 'Expenses:Purchases';

    var totalAmount = Big(0);
    journal.transactions().filter(t => t.date.month == 10)
      .forEach(t => {

        var p = t.posting.filter(p => p.account != null &&  p.account[0] == 'Expenses' && p.account[1] == 'Purchases');
        if(p == null || p.length == 0) return;

        var total = Big(0);
        p.forEach(pt => total = total.plus(pt.amount));
        var account = p.length > 1 ? "<Total>" : p[0].account;
        console.log(t.date.day + ' ' + t.payee + "  " + account +  " "  +'$' + total.toFixed(2));
        totalAmount = totalAmount.plus(total);
      })

    console.log("Total: $" + totalAmount.toFixed(2));
  });
})