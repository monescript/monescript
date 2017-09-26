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
      + " Expenses:Utilities:Phone 1  "
    );

    expect(result.year).toEqual(2016);
    expect(result.month).toEqual(8);
    expect(result.day).toEqual(23);
    expect(result.status).toEqual('!');
    expect(result.payee).toEqual('Payee Name 1234');
    console.log(result.posting[0].account[0]);
    expect(result.posting[0].account[0]).toEqual('Expenses');
    expect(result.posting[0].account[1]).toEqual('Utilities');
    expect(result.posting[0].account[2]).toEqual('Phone 1');
    /*expect(result.posting[0].amount).toEqual(1234.56);
    expect(result.posting[0].currency).toEqual('$');*/
  });
});
