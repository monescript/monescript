describe("Account name helper", function() {
  let journal = require('../../../src/journal');
  let parser = require('../../../src/parser/journal-parser');
  let balanceTreeHelper = require('../../../src/ui/util/balance-filter-helper');
  let fs = require('fs');

  beforeEach(function() {
    journal.reset();
  });

  describe("filteredBalanceTree", function() {

    it("can build simple tree", function() {
       createJournal('simple.journal');

       let tree = balanceTreeHelper.filteredBalanceTree(journal);

       expect(tree).toEqual(readFromJsonFile('simple.tree'));
    });

    it("can filter by account regex", function() {
       createJournal('two-level.journal');

       let tree = balanceTreeHelper.filteredBalanceTree(journal, {
          account: 'Food'
       });
       expect(tree).toEqual(readFromJsonFile('two-level.name.tree'));
    });

    it("can filter by month", function() {
       createJournal('two-level.journal');

       let tree = balanceTreeHelper.filteredBalanceTree(journal, {
          month: 8
       });
       expect(tree).toEqual(readFromJsonFile('two-level.month.tree'));
    });

    it("can filter by payee", function() {
       createJournal('two-level.journal');

       let tree = balanceTreeHelper.filteredBalanceTree(journal, {
          payee: 'lower'
       });
       expect(tree).toEqual(readFromJsonFile('two-level.payee.tree'));
    });

    it("can filter by both", function() {
       createJournal('two-level.journal');

       let tree = balanceTreeHelper.filteredBalanceTree(journal, {
          account: 'Food',
          month: 8
       });
       expect(tree).toEqual(readFromJsonFile('two-level.both.tree'));
    });
  })

  describe("filteredMonthlyBalance", function() {
    it("returns zero balance without filter", function() {
       createJournal('simple-two-entry.journal');
       var bal = balanceTreeHelper.filteredMonthlyBalance(journal, {});
       expect(bal).toEqual(0.0);
    });

    it("returns balance filtered by account name", function() {
       createJournal('simple-two-entry.journal');

       var bal = balanceTreeHelper.filteredMonthlyBalance(journal, {
          account: 'Food'
       });
       expect(bal).toEqual(50.02);
    });

    it("returns zero balance when filtered by month", function() {
       createJournal('simple-two-entry.journal');

       var bal = balanceTreeHelper.filteredMonthlyBalance(journal, {
          month: 5
       });
       expect(bal).toEqual(0.0);
    });

    it("returns balance filtered by payee", function() {
       createJournal('two-level.journal');

       let bal = balanceTreeHelper.filteredMonthlyBalance(journal, {
          payee: 'lower'
       });
       expect(bal).toEqual(0.0);
    });

    it("returns balance filtered by payee and account", function() {
       createJournal('two-level.journal');

       let bal = balanceTreeHelper.filteredMonthlyBalance(journal, {
          payee: 'lower',
          account: 'food'
       });
       expect(bal).toEqual(122.04);
    });


    it("returns balance filtered by account name and month", function() {
       createJournal('two-level.journal');

       var bal = balanceTreeHelper.filteredMonthlyBalance(journal, {
          account: 'Bills',
          month: 10
       });
       expect(bal).toEqual(111.91);
    });
  })

  describe("filteredWeeklyBalance", function() {
    it("returns zero balance without filter", function() {
       createJournal('simple-two-entry.journal');
       var bal = balanceTreeHelper.filteredWeeklyBalance(journal, {});
       expect(bal).toEqual(0.0);
    });

    it("returns balance filtered by account name", function() {
       createJournal('simple-two-entry.journal');

       var bal = balanceTreeHelper.filteredWeeklyBalance(journal, {
          account: 'Food'
       });
       expect(bal).toEqual(50.02);
    });

    it("returns zero balance when filtered by week", function() {
       createJournal('simple-two-entry.journal');

       var bal = balanceTreeHelper.filteredWeeklyBalance(journal, {
          week: 5
       });
       expect(bal).toEqual(0.0);
    });

    it("returns balance filtered by account name and week", function() {
       createJournal('two-level.journal');

       var bal = balanceTreeHelper.filteredWeeklyBalance(journal, {
          account: 'Bills',
          week: 41
       });
       expect(bal).toEqual(111.91);
    });
  })

  describe("isTransactionMatchingTheFilter", function() {
      const txn = {
        type: 'transaction',
        date: { year: 2017, month: 11, day: 29 },
        payee: 'other',
        posting: [
          {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56}
        ]
      };

      it("true for empty filter", function() {
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {})).toBeTruthy();
      });

      it("matches payee case insensitive", function() {
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {payee: 'THE'})).toBeTruthy();
      });

      it("matches account case insensitive", function() {
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {account: 'PHO'})).toBeTruthy();
      });

      it("matches month", function() {
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {month: 11})).toBeTruthy();
      });

      it("fails on wrong values", function() {
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {payee: '123'})).toBeFalsy();
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {account: 'abc'})).toBeFalsy();
          expect(balanceTreeHelper.transactionMatchesFilter(txn, {month: 2})).toBeFalsy();
      });

      it("matches all together", function() {
        expect(balanceTreeHelper.transactionMatchesFilter(txn, {payee:'OTH', account: 'exp', month: 11})).toBeTruthy();
      });
  })

  describe("matchingPostings", function() {
      const posting = [
         {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56},
         {account: [ 'Expenses', 'Department'], currency: '$', amount: 56.78},
         {account: [ 'Assets', 'Savings'], currency: '$', amount: 1291.34}
       ];

      const txn = {
        type: 'transaction',
        date: { year: 2017, month: 11, day: 29 },
        payee: 'other',
        posting: posting
      };

      it("returns all for empty filter", function() {
          expect(balanceTreeHelper.matchingPostings(txn, {})).toEqual(posting);
      });

      it("filters by account", function() {
          expect(balanceTreeHelper.matchingPostings(txn, {account: 'DepART'})).toEqual([posting[1]]);
      });
  })

  describe("getWeekNumber", function() {
      it("returns week number for date", function() {
         expect(balanceTreeHelper.getWeekNumber(new Date(2017, 0, 5))).toEqual({year: 2017, week: 1});
      });
  })

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