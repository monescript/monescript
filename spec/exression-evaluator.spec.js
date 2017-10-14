describe("Expression Evaluator ", function() {

  var expressionEvaluator = require('../src/expression-evaluator');
  var Big = require('big.js');
  var grammarParser = require("../src/parser/grammar-parser.js");

  it("can evaluate simple amount", function() {
      expect(eval("(100)")).toEqual({currency: null, amount: Big(100.00)});
  });

  it("can evaluate simple amount with currency", function() {
      expect(eval("($1234.56)")).toEqual({currency: '$', amount: Big(1234.56)});
  });

  it("can add", function() {
      expect(eval("($100 + 200)")).toEqual({currency: '$', amount: Big(300.00)});
  });

  it("can subtract", function() {
      expect(eval("($100 - 200)")).toEqual({currency: '$', amount: Big(-100.00)});
  });

  it("can multiply", function() {
      expect(eval("($100 * 1.13)")).toEqual({currency: '$', amount: Big(113.00)});
  });

  it("can divide", function() {
      expect(eval("($100 / 4)")).toEqual({currency: '$', amount: Big(25.00)});
  });

  it("supports complex expression", function() {
      expect(eval("($100 / 4 + ($500 * 3) - 10 )")).toEqual({currency: '$', amount: Big(1515.00)});
  });

  var eval = function(expression){
      var result = grammarParser.parse(
        "2016/08/23 other\n" +
        " Expenses:Utilities:Phone 1   " + expression + " \n"
      );

      return expressionEvaluator.evaluate(result.posting[0].amount);
  }
})