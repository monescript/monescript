describe("Journal ", function() {

  var journal = require('../src/journal');
  var Big = require('big.js');

  var grammarParser = require("../src/parser/grammar-parser.js");

  beforeEach(function() {
    journal.reset();
  });

  it("transactions are initially empty", function() {
    var txns = journal.transactions();
    expect(txns).toEqual([]);
  });

  it("can process bucket command and show empty transactions", function() {
    journal.add({"type":"bucket","account":["Assets","Checking"]});
    var txns = journal.transactions();
    expect(txns).toEqual([]);
  });

  it("can add a transaction", function() {
    var txn = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56 },
        {account: [ 'Assets', 'Checking'], currency: '$', amount: -1234.56 }
      ]
    };

    var txnCopy = bigCopy(txn);

    journal.add(txn);

    expect(journal.transactions()[0] !== txn).toBeTruthy();
    expect(journal.transactions()).toEqual([txnCopy]);
  });

  var copy = function(txn){
    return JSON.parse(JSON.stringify(txn));
  }

  var bigCopy = function(txn){
    var bigTxn = copy(txn);

    bigTxn.posting.filter(t => t.type != 'comment').forEach(p => {
      p.amount = Big(p.amount)
    });

    return bigTxn;
  }

  it("can process a transaction with comment posting", function() {
    journal.add({"type":"bucket","account":["Assets","Checking"]});

    var txn = {"type":"transaction","date":{"year":2017,"month":1,"day":7},
                    "payee":"ultramar","posting":[
                      {"type":"comment","text":" description: 1.099"},
                      {"account":["Expenses","Auto","Gas"],"currency":"$","amount":45.16},
                      {"account":["Assets","Chequing"],"currency":"$","amount":-45.16}
                    ]
                    ,"status":"*"};

    var txnCopy = bigCopy(txn);

    journal.add(txn);

    expect(journal.transactions()).toEqual([txnCopy]);
  });

  it("can process two transactions", function() {

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

    var bigTxns = txns.map(t => bigCopy(t));

    expect(journal.transactions()).toEqual(bigTxns);
  });

  it("can process a transactions with balancing amount-less posting and reconstructs amount", function() {
    var txn = {
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
    };

    var txnCopy = copy(txn);
    txnCopy.posting[3].amount = -20.00;
    txnCopy.posting[3].currency = '$';
    txnCopy.posting[3].emptyInitialAmount = true;
    txnCopy = bigCopy(txnCopy);

    journal.add(txn);

    expect(journal.transactions()).toEqual([txnCopy]);
  });


  it("accepts a transaction with a single posting when bucket is defined and reconstructs missing posting", function() {
    journal.add({"type":"bucket","account":["Assets","Checking"]});
    var txn = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56},
      ]
    };

    var txnCopy = copy(txn);
    txnCopy.posting.push(
      {account: [ "Assets","Checking" ], currency: '$', amount: -1234.56}
    );
    txnCopy = bigCopy(txnCopy);

    journal.add(txn);

    expect(journal.transactions()).toEqual([txnCopy]);
  });

  it("can process a transaction with expression as amount", function() {
    var txn = grammarParser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  ($1234.56 * 1.2 + ($56 -  $134) - $0) ; second bill \n" +
      " Assets:Checking"
    );

    journal.add(txn);

    var txnCopy = copy(txn);
    txnCopy.posting[0].amountExpression = txnCopy.posting[0].amount;
    txnCopy.posting[0].amount = 1403.472;
    txnCopy.posting[0].currency = '$';
    txnCopy.posting[1].amount = -1403.472;
    txnCopy.posting[1].currency = '$';
    txnCopy.posting[1].emptyInitialAmount = true;
    txnCopy = bigCopy(txnCopy);

    expect(journal.transactions()).toEqual([txnCopy]);
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
      expect(e.txn).toEqual(bigCopy(txn));
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
      expect(e.txn).toEqual(bigCopy(txn));
    }
  });

  it("returns number of months with transactions", function() {

    var txn = grammarParser.parse(
      "2016/02/12 other\n" +
      " Expenses:Utilities:Phone 1  $123.45 \n" +
      " Assets:Checking"
    );
    journal.add(txn);


    var txn = grammarParser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  $123.45 \n" +
      " Assets:Checking"
    );
    journal.add(txn);

    expect(journal.getTransactionMonthCount()).toEqual(2);
  });

})