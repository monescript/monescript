  let Generator = {
  payees : [
    {
      payee: 'PartyCity',
      accounts: {
        'Expenses:Entertainment': 50.0,
        'Expenses:Clothing': 50.0
      }
    },
    {
      payee: 'Rexall',
      accounts: {
        'Expenses:Pharmacy' : 30.0,
      }
    },
    {
      payee: 'Putting Edge',
      accounts: {
        'Expenses:Entertainment' : 100.0,
      }
    },
    {
      payee: 'Laser Quest',
      accounts: {
        'Expenses:Entertainment' : 100.0,
      }
    },
    {
      payee: 'Sobeys',
      accounts: {
        'Expenses:Food:Grocery' : 100.0,
      }
    },
    {
      payee: 'Loblaws',
      accounts: {
        'Expenses:Food:Grocery' : 100.0,
        'Expenses:Department' : 20.0,
      }
    },
    {
      payee: 'Costco',
      accounts: {
        'Expenses:Food:Grocery' : 200.0,
      }
    },
    {
      payee: 'Tim Hortons',
      accounts: {
        'Expenses:Food:Takeout' : 20.0,
      }
    },
    {
      payee: 'Starbucks',
      accounts: {
        'Expenses:Food:Takeout' : 20.0,
      }
    },
    {
      payee: 'Ikea',
      accounts: {
        'Expenses:Furniture' : 300.0,
      }
    },
    {
      payee: 'Enbridge',
      accounts: {
        'Expenses:Bills:Gas' : 150.0,
      }
    },
    {
      payee: 'Hydro One',
      accounts: {
        'Expenses:Bills:Electricity' : 100.0,
      }
    },
    {
      payee: 'Toronto',
      accounts: {
        'Expenses:Bills:Water' : 50.0,
      }
    },
  ],


  transactionsDay: function(year, month, day){
    let t = '';
    for(let i = 0; i < this.count(10); i++){
      let txn = this.transaction();
      t = `${year}/${month}/${day} * ${txn.payee}\n`;
      txn.posting.forEach(p => {
        t += `  ${p.account}  $${p.amount}\n`
      });
      t += `  Assets:Bank:Checking\n`
    }
    return t;
  },

  transaction: function(){
    var txn = {};

    var pt = this.payee();
    txn.payee = pt.payee;
    txn.posting = [];
    let aKeys = Object.keys(pt.accounts);
    let count = aKeys.length;
    for(let p = 0; p < count; ++p)
    {
      let account = aKeys[p];
      txn.posting.push({
        account: account,
        amount: this.amount(5.0, pt.accounts[account])
      });
    }
    return txn;
  },

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
