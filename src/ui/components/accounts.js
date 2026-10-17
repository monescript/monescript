var balanceFilterHelper = require('../util/balance-filter-helper');
var escapeHtml = require('../util/html-helper').escapeHtml;

function accountDisplay(value){
  return (value.balance == null ? '' : value.balance.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })) +
    ' ' + value.name;
}

function renderLevel(level){
  var html = '<ul>';
  Object.keys(level).forEach(function(key){
    var value = level[key];
    html += '<li><b><a href="#" data-account="' + escapeHtml(value.fullName) + '">' +
            escapeHtml(accountDisplay(value)) + '</a></b>';
    if(value.accounts != null && Object.keys(value.accounts).length > 0){
      html += '<div>' + renderLevel(value.accounts) + '</div>';
    }
    html += '</li>';
  });
  return html + '</ul>';
}

module.exports = {
  create: function(root, opts){
    root.addEventListener('click', function(e){
      var link = e.target.closest('a[data-account]');
      if(link == null) return;
      e.preventDefault();
      opts.onAccount(link.getAttribute('data-account'));
    });

    return {
      update: function(state){
        var tree = balanceFilterHelper.filteredBalanceTree(state.journal, state.filter) || {};
        root.innerHTML = renderLevel(tree);
      }
    };
  }
};