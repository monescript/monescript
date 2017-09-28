describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

  beforeEach(function() {
      var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');
      this.parser = peg.generate(cliGrammar);
  });

  /*
  From: http://ledger-cli.org/3.0/doc/ledger3.html#Keeping-a-Journal

  The format is very flexible and it isn’t necessary that you indent and space out things exactly as shown.
  The only requirements are that the start of the transaction (the date typically) is at the beginning of the first line of the transaction,
  and the accounts are indented by at least one space. If you omit the leading spaces in the account lines Ledger will generate an error.
  There must be at least two spaces, or a tab, between the amount and the account.
  If you do not have adequate separation between the amount and the account Ledger will give an error and stop calculating.
  */



  it("should be able to parse a simple transaction", function() {

    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('!');
    expect(result.payee).toEqual('Payee Name 1234');
    expect(result.posting.length).toEqual(1);
    verifyFirstPosting(result);
  });

  it("should be able to parse a transaction with two postings", function() {

    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  $-1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('*');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(2);
    verifyFirstPosting(result);
    verifySecondPosting(result);
  });

  it("should be able to parse a transaction with header comment", function() {
    var result = this.parser.parse(
      "; First phone bill \n" +
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('*');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(1);
    verifyFirstPosting(result);
  });
/*
  it("should be able to parse a transaction with mid comment", function() {
    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      "; First phone bill \n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('*');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(1);
    verifyFirstPosting(result);
  });
*/


  var verifyFirstPosting = function(result){
      expect(result.posting[0].account.length).toEqual(3);
      expect(result.posting[0].account[0]).toEqual('Expenses');
      expect(result.posting[0].account[1]).toEqual('Utilities');
      expect(result.posting[0].account[2]).toEqual('Phone 1');
      expect(result.posting[0].amount).toEqual(1234.56);
      expect(result.posting[0].currency).toEqual('$');
  }

  var verifySecondPosting = function(result){
    expect(result.posting[1].account.length).toEqual(4);
    expect(result.posting[1].account[0]).toEqual('Assets');
    expect(result.posting[1].account[1]).toEqual('The Country');
    expect(result.posting[1].account[2]).toEqual('Bank One');
    expect(result.posting[1].account[3]).toEqual('Account Two');
    expect(result.posting[1].amount).toEqual(-1234.56);
    expect(result.posting[1].currency).toEqual('$');
  }

  var verifyDate = function(result){
    expect(result.date.year).toEqual(2016);
    expect(result.date.month).toEqual(8);
    expect(result.date.day).toEqual(23);
  }

});
