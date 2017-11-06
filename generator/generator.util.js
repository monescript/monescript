  let Generator = {
  payees : [
    {
      payee: 'PartyShack',
      accounts: {
        'Expenses:Entertainment': 50.0,
        'Expenses:Clothing': 50.0
      }
    },
    {
      payee: 'Pharmacy One',
      accounts: {
        'Expenses:Pharmacy' : 30.0,
      }
    },
    {
      payee: 'Golf Equip',
      accounts: {
        'Expenses:Entertainment' : 100.0,
      }
    },
    {
      payee: 'Laser Play',
      accounts: {
        'Expenses:Entertainment' : 100.0,
      }
    },
    {
      payee: 'Groceries and More',
      accounts: {
        'Expenses:Food:Grocery' : 100.0,
      }
    },
    {
      payee: 'Giant Moose',
      accounts: {
        'Expenses:Food:Grocery' : 100.0,
        'Expenses:Department' : 20.0,
      }
    },
    {
      payee: 'Lower Pricer',
      accounts: {
        'Expenses:Food:Grocery' : 200.0,
      }
    },
    {
      payee: 'The Doughnut',
      accounts: {
        'Expenses:Food:Takeout' : 20.0,
      }
    },
    {
      payee: 'Coffee Stop',
      accounts: {
        'Expenses:Food:Takeout' : 20.0,
      }
    },
    {
      payee: 'Furnitura',
      accounts: {
        'Expenses:Furniture' : 300.0,
      }
    },
    {
      payee: 'Eastern Gas',
      accounts: {
        'Expenses:Bills:Gas' : 150.0,
      }
    },
    {
      payee: 'Northern Hydro',
      accounts: {
        'Expenses:Bills:Electricity' : 100.0,
      }
    },
    {
      payee: 'City Services',
      accounts: {
        'Expenses:Bills:Water' : 50.0,
      }
    },
    {
      payee: 'Client',
      accounts: {
        'Assets:Bank:Checking' : 2345.67,
      },
      counterAccounts: {
        'Income:Contract': 0.0
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
      txn.counterPosting.forEach(p => {
        t += `  ${p.account} \n`
      });
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

    txn.counterPosting = [];
    let caKeys = pt.counterAccounts == null ? [] : Object.keys(pt.counterAccounts);
    if(caKeys.length == 0)
      caKeys = ['Assets:Bank:Checking'];

    let caCount = caKeys.length;
    for(let p = 0; p < caCount; ++p)
    {
      let account = caKeys[p];
      txn.counterPosting.push({
        account: account
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
