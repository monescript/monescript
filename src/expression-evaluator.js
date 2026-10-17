var Big = require('big.js');

var ExpressionEvaluator = {
  evaluate: function(expr, context){
    context = context || {};
    if (expr.type == 'BinaryExpression'){
      var left = this.evaluate(expr.left, context);
      var right = this.evaluate(expr.right, context);
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
    } else if(expr.type == 'RunningTotal') {
      return {currency: null, amount: context.runningTotal != null ? context.runningTotal : Big(0)};
    }
    return {currency: null, amount: Big(expr)};
  }
}

module.exports = ExpressionEvaluator;