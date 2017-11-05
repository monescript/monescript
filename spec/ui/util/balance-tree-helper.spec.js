describe("Account name helper", function() {
  let journal = require('../../../src/journal');
  let parser = require('../../../src/parser/journal-parser');
  let balanceTreeHelper = require('../../../src/ui/util/balance-tree-helper');
  let fs = require('fs');

  beforeEach(function() {
    journal.reset();
  });


  it("can build simple tree", function() {
     createJournal('simple.journal');

     let tree = balanceTreeHelper.filteredBalanceTree(journal, {
        accountRegex: '',
        month: 5
     });

     expect(tree).toEqual(readFromJsonFile('simple.tree'));
  });


  xit("adjusts balance by filtered accounts", function() {
     createJournal('two-level.journal');

     let tree = balanceTreeHelper.filteredBalanceTree(journal, {
        accountRegex: 'Food',
        month: 10
     });
     console.log(JSON.stringify(tree, null, 2));
     expect(tree).toEqual(readFromJsonFile('two-level.name.tree'));
  });


  let readFromJsonFile = function(filename){
    var text = fs.readFileSync('spec/resources/ui/util/balance-tree-helper/' + filename, 'utf8');
    return JSON.parse(text);
  }

  let createJournal = function(filename){
    var text = fs.readFileSync('spec/resources/ui/util/balance-tree-helper/' + filename, 'utf8');
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
  }

});