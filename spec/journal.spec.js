describe("Journal.balance() ", function() {

  var journal = require('../src/journal');


  beforeEach(function() {
    journal.reset();
  });

  it("balance is initially empty", function() {
    var balance = journal.balance();
    expect(balance).toEqual({});
  });

  it("can process bucket command and show empty balance", function() {
    journal.add({"type":"bucket","account":["Assets","Checking"]});
    var balance = journal.balance();
    expect(balance).toEqual({
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: 0}
    });
  });

  it("can process transaction command", function() {
    journal.add({
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -1234.56 }
      ]
    });

    expect(journal.balance()).toEqual({
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: 1234.56},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: -1234.56}
    });
  });
})