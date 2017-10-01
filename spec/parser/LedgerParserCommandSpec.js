describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

  beforeEach(function() {
      var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');
      this.parser = peg.generate(cliGrammar);
  });

/*

http://ledger-cli.org/3.0/doc/ledger3.html#Command-Directives

bucket

    Defines the default account to use for balancing transactions. Normally, each transaction has at least two postings, which must balance to zero.
    Ledger allows you to leave one posting with no amount and automatically balance the transaction in the posting. The bucket allows you to fill in all
    postings and automatically generate an additional posting to the bucket account balancing the transaction. If any transaction is unbalanced, it will
    automatically be balanced against the bucket account.

*/

  it("should be able to parse bucket command", function() {
    var result = this.parser.parse("bucket Assets:Checking");
    expect(result.length).toEqual(1);
    expect(result[0].type).toEqual('bucket');
    expect(result[0].account).toEqual(['Assets', 'Checking']);
  });

  it("should be able to parse include command", function() {
    var result = this.parser.parse("include file.txt");
    expect(result.length).toEqual(1);
  });

  it("should be able to parse year command", function() {
    var result = this.parser.parse("year 2017");
    expect(result.length).toEqual(1);
  });
})