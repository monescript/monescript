module.exports = {

  filter: function(name, accounts){
    let self = this;

    let firstPass = Object.keys(accounts)
    .filter(a => a.toLowerCase().indexOf(name.toLowerCase()) >= 0)
    .map(a => accounts[a]);

    let names = new Set();
    firstPass.forEach(acct => {
      var parent = [];
      acct.account.forEach(a => {
        parent.push(a);
        names.add(self.encodeAccountName(parent));
      });
    });

    return Object.keys(accounts)
      .filter(a => names.has(a))
      .map(a => accounts[a]);
  },

  encodeAccountName: function(accountArray){
    return accountArray.join(':');
  },
};