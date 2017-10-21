
var parser = require('../../src/parser/journal-parser.js');
var journal = require('../../src/journal.js');
var balancer = require('../../src/balance');
var Big = require('big.js');


window.calculateBalance = function(text){

  document.getElementById('data').value = text;

  var balance = "";


  parser.reset(text)
  var chunk;
  try{
    while((chunk = parser.next()) != null){
      journal.add(chunk);
    }
  }catch(e){
    console.log(e);
    console.log('Failing on line ' + JSON.stringify(chunk));
  }

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
        balance += value + name + "\n";
    });


  document.getElementById('balance').value = balance;
}