module.exports = {
  encodeAccountName: function(accountArray){
    return accountArray.join(':');
  },

  accountMatches: function(account, expression){
    return this.nameMatches(this.encodeAccountName(account), expression.toLowerCase());
  },

  nameMatches: function(name, expression){
    return name.toLowerCase().indexOf(expression.toLowerCase()) >= 0;
  },
};