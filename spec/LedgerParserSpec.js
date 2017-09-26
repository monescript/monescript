describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

  beforeEach(function() {

  });

  it("should be able to parse a transaction", function() {
    var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');

    var parser = peg.generate(cliGrammar);
    var result = parser.parse("2016/08/23 ! hello world 3");
    console.log(result);

    expect(result.year).toEqual(2016);
    expect(result.month).toEqual(8);
    expect(result.day).toEqual(23);
  });
});
