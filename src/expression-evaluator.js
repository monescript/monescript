var Big = require('big.js');

var ExpressionEvaluator = {
  evaluate: function(expr){
    if (expr.type == 'BinaryExpression'){
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
    } else if(expr.type == 'Literal') {
      return {currency: expr.currency, amount: Big(expr.amount)};
    }
    return {currency: null, amount: Big(expr)};
  }
}

module.exports = ExpressionEvaluator;