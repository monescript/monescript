describe("Experiments ", function() {
  var fs = require('fs');
  var parser = require('../src/parser/journal-parser');
  var journal = require('../src/journal');
  var balancer = require('../src/balance');

  beforeEach(function() {
    journal.reset();
    var file = fs.readFileSync('', 'utf8');

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

  xit("print balance", function() {

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
})