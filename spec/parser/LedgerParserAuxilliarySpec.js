describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

  beforeEach(function() {
      var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');
      this.parser = peg.generate(cliGrammar);
  });

/*

http://ledger-cli.org/3.0/doc/ledger3.html#Transactions-and-Comments

      ; # % | *
          A line beginning with a semicolon, pound, percent, bar or asterisk indicates a comment, and is ignored. Comments will not be returned in a “print” response.

*/

  it("should be able to parse empty lines", function() {
    var result = this.parser.parse("");
    expect(result.length).toEqual(0);

    var result = this.parser.parse("\n");
    expect(result.length).toEqual(0);

    var result = this.parser.parse("\n\n\n\r\n");
    expect(result.length).toEqual(0);

    var result = this.parser.parse("   \n");
    expect(result.length).toEqual(0);
  });


  it("should be able to parse line comments", function() {
    var result = this.parser.parse(
      "; First phone bill \n\n\n" +
      "# comment \n"
    );

    expect(result.length).toEqual(0);
  });

})