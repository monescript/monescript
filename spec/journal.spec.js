describe("Journal.balance() ", function() {

  var journal = require('../src/journal');
  var Big = require('big.js');

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
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(0.0)}
    });
  });

  it("can process a transaction", function() {
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
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(1234.56)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-1234.56)}
    });
  });

  it("accepts a transaction with a single posting when bucket is defined", function() {
    journal.add({"type":"bucket","account":["Assets","Checking"]});
    journal.add({
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56},
      ]
    });

    expect(journal.balance()).toEqual({
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(1234.56)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-1234.56)}
    });
  });

  it("fails on a transaction with a single posting when bucket is not defined", function() {
    var txn = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56 },
      ]
    }
    try{
      journal.add(txn);
      fail('should fail on unbalanced transaction without bucket')
    }catch(e){
      expect(e).toBeDefined();
      expect(e.txn).toEqual(txn);
    }
  });

  it("fails on unbalanced transaction", function() {
    var txn = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 100.12 },
        {account: [ 'Expenses', 'Utilities', 'Electricity' ], currency: '$', amount: 45.12 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -150.56 }
      ]
    };
    try{
      journal.add(txn);
      fail('should fail on unbalanced transaction')
    }catch(e){
      expect(e).toBeDefined();
      expect(e.txn).toEqual(txn);
    }
  });
})