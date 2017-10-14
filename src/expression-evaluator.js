var Big = require('big.js');

var ExpressionEvaluator = {
  evaluate: function(expr){
    if(expr.type == 'BinaryExpression'){
      var left = this.evaluate(expr.left);
      var right = this.evaluate(expr.right);
      var currency = left.currency == null ? right.currency: left.currency;
      var amount;
      switch(expr.operator) {
        case '-':  amount = left.amount.minus(right.amount); break;
        case '+':  amount = left.amount.add(right.amount); break;
        case '/':  amount = left.amount.div(right.amount); break;
        case '*':  amount = left.amount.times(right.amount); break;
        default: throw Error('Unknown operator: ' + exp.operator);
      }
      var retValue = {currency: currency, amount: amount};
      return retValue;

    }else if(expr.length == 2 && expr[0] != null) {
      return {currency: expr[0], amount: Big(expr[1])};
    }
    return {currency: null, amount: Big(expr)};
  }
}

module.exports = ExpressionEvaluator;