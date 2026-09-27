describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

    beforeEach(function() {
      var cliGrammar = fs.readFileSync('src/_experimental.pegjs', 'utf8');
      this.parser = peg.generate(cliGrammar);
    });


/*
 it("should be able to parse multiple transactions", function() {
    var result = this.parser.parse(


      "8016/08/23 other\n" +
      " Assets:Chequing  $123.45\n" +
      " Income:Salary  "
    );

    console.log(result)
  });
  */
})