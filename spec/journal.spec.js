describe("Journal.balance() ", function() {

  var journal = require('../src/journal');
  var Big = require('big.js');

  var grammarParser = require("../src/parser/grammar-parser.js");

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

  it("can process two transactions and update balance", function() {
    journal.add({
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 100.11 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -100.11 }
      ]
    });
    journal.add({
      type: 'transaction',
      date: { year: 2016, month: 8, day: 24 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Purchases', 'Department' ], currency: '$', amount: 20.00 },
        {account: [ 'Expenses', 'Purchases', 'Grocery' ], currency: '$', amount: 50.12 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -70.12 }
      ]
    });

    expect(journal.balance()).toEqual({
      'Expenses:Purchases:Department': {account: ['Expenses', 'Purchases', 'Department' ], currency: '$', balance: Big(20.00)},
      'Expenses:Purchases:Grocery': {account: ['Expenses', 'Purchases', 'Grocery' ], currency: '$', balance: Big(50.12)},
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(100.11)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-170.23)}
    });
  });

  it("can process a transactions with balancing amountless posting", function() {
    journal.add({
      type: 'transaction',
      date: { year: 2016, month: 8, day: 24 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Purchases', 'Department' ], currency: '$', amount: 40.00 },
        {account: [ 'Expenses', 'Purchases', 'Grocery' ], currency: '$', amount: 50.12 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -70.12 },
        {account: [ 'Assets', 'Savings']}
      ]
    });

    expect(journal.balance()).toEqual({
      'Expenses:Purchases:Department': {account: ['Expenses', 'Purchases', 'Department' ], currency: '$', balance: Big(40.00)},
      'Expenses:Purchases:Grocery': {account: ['Expenses', 'Purchases', 'Grocery' ], currency: '$', balance: Big(50.12)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-70.12)},
      'Assets:Savings': {account: ["Assets","Savings"], currency: '$', balance: Big(-20.00)}
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

  it("can process a transaction with expression as amount", function() {
    var result = grammarParser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  ($1234.56 * 1.2 + ($56 -  $134) - $0) ; second bill \n" +
      " Assets:Checking"
    );

    journal.add(result);

    expect(journal.balance()).toEqual({
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(1403.472)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-1403.472)}
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