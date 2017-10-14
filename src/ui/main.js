
var parser = require('../../src/parser/journal-parser.js');
var journal = require('../../src/journal.js');

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

  var b = journal.balance();
  Object.keys(b).filter(function(a){
    return a.toLowerCase().indexOf('exp') >= 0;
  })
  .sort(function(a, b) {
    return a.localeCompare(b)
  })
  .forEach(function(a,index) {
      balance += a + " $" + b[a].balance + "\n";
  });


  document.getElementById('balance').value = balance;
}