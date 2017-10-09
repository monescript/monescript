var Journal = {

  reset: function(){
    this.bucketAccount = {};
    this.accounts = {};
  },

  add: function(entry){

    switch(entry.type)
    {
      case 'bucket':
        this.bucket(entry);
        break;

      case 'transaction':
        this.transaction(entry);
        break;
    }

    return this;
  },

  balance: function(){
    return this.accounts;
  },

  //----------- Internal state

  bucketAccount: {},
  accounts: {},

  //----------- Internal methods

  bucket: function(entry){
    this.bucketAccount = entry.account;
    var accountName = entry.account.join(':');
    if(this.accounts[accountName] == null)
    {
      this.accounts[accountName] = {
        account: entry.account,
        currency: '$',
        balance: 0,
      }
    }
  },

  transaction: function(entry){
    var journal = this;
    entry.posting.forEach(function(p) {
      var accountName = p.account.join(':');
      if(journal.accounts[accountName] == null)
      {
        journal.accounts[accountName] = {
          account: p.account,
          currency: p.currency,
          balance: p.amount,
        }
      }
    })
  },
}

module.exports = Journal;