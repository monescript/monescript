describe("Balance ", function() {

  var balancer = require('../src/balance');
  var journal = require('../src/journal');
  var Big = require('big.js');

  beforeEach(function() {
    journal.reset();
  });

  it("balance is initially empty", function() {
    var balance = balancer.balance(journal);
    expect(balance).toEqual({});
  });

  it("can process journal with bucket account and show empty balance", function() {

    journal.add({"type":"bucket","account":["Assets","Checking"]});

    var balance = balancer.balance(journal);
    expect(balance).toEqual({
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(0.0)}
    });
  });

  it("can show balance on a single transaction", function() {
    var txn = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -1234.56 }
      ]
    }

    journal.add(txn);

    expect(balancer.balance(journal)).toEqual({
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(1234.56)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-1234.56)}
    });
  });

  it("can show balance for two transactions", function() {
    var txns = [{
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 100.11 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -100.11 }
      ]
    },{
      type: 'transaction',
      date: { year: 2016, month: 8, day: 24 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Purchases', 'Department' ], currency: '$', amount: 20.00 },
        {account: [ 'Expenses', 'Purchases', 'Grocery' ], currency: '$', amount: 50.12 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -70.12 }
      ]
    }];

    txns.forEach(t => journal.add(t));

    expect(balancer.balance(journal)).toEqual({
      'Expenses:Purchases:Department': {account: ['Expenses', 'Purchases', 'Department' ], currency: '$', balance: Big(20.00)},
      'Expenses:Purchases:Grocery': {account: ['Expenses', 'Purchases', 'Grocery' ], currency: '$', balance: Big(50.12)},
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(100.11)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-170.23)}
    });
  });

  it("can balance with transaction filter", function() {
    var txns = [{
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '*',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 100.11 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -100.11 }
      ]
    },{
      type: 'transaction',
      date: { year: 2016, month: 8, day: 24 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Purchases', 'Department' ], currency: '$', amount: 20.00 },
        {account: [ 'Expenses', 'Purchases', 'Grocery' ], currency: '$', amount: 50.12 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -70.12 }
      ]
    }];

    txns.forEach(t => journal.add(t));

    var clearedTxnFilter = txn => txn.status == '*';

    expect(balancer.balance(journal, clearedTxnFilter)).toEqual({
      'Expenses:Utilities:Phone 1': {account: ['Expenses', 'Utilities', 'Phone 1' ], currency: '$', balance: Big(100.11)},
      'Assets:Checking': {account: ["Assets","Checking"], currency: '$', balance: Big(-100.11)}
    });
  });
});