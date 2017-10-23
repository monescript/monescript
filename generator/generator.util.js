let Generator = {
  payees : [
    'PartyCity',
    'Rexall',
    'Putting Edge',
    'Laser Quest',
    'Sobeys',
    'Dominion',
    'Loblaws',
    'T&T',
    'Tim Hortons',
    'Starbucks'
  ],

  expenseAccounts : [
    'Expenses:Grocery',
    'Expenses:Entertainment',
    'Expenses:Clothing',
    'Expenses:Bills:Electricity',
    'Expenses:Car:Gasoline',
  ],

  expenseAccount: function(){
    return this.randomItem(this.expenseAccounts);
  },

  amount : function(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
  },

  count: function(max){
      return this.index(1, max);
  },

  index : function(min, max) {
    return (Math.random() * (max - min) + min).toFixed();
  },

  payee : function (){
    return this.randomItem(this.payees);
  },

  randomItem : function (list){
    let i = this.index(0, list.length - 1)
    return list[i];
  }
}
module.exports = Generator;
