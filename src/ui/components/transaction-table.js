var accountNameHelper = require('../util/account-name-helper');
var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');
var escapeHtml = require('../util/html-helper').escapeHtml;
var Big = require('big.js');

function transactionComments(t){
  var comments = [];
  if(t.note != null){
    comments.push(t.note);
  }
  (t.posting || []).forEach(function(p){
    if(p.type == 'comment'){
      comments.push(p.text);
    } else if(p.note != null){
      comments.push(p.note);
    }
  });
  return comments.map(function(c){ return String(c).trim(); })
                 .filter(function(c){ return c.length > 0; });
}

function weekNumber(t){
  var txnDate = new Date(t.date.year, t.date.month - 1, t.date.day);
  return balanceFilterHelper.getWeekNumber(txnDate).week;
}

module.exports = {
  create: function(root){
    root.innerHTML =
      '<table class="table table-striped table-sm">' +
        '<thead><tr>' +
          '<th scope="col">Date [week]</th>' +
          '<th scope="col">Amount</th>' +
          '<th scope="col">Payee</th>' +
          '<th scope="col">Account</th>' +
          '<th scope="col" style="width: 1%"></th>' +
        '</tr></thead>' +
        '<tbody></tbody>' +
      '</table>';
    var tbody = root.querySelector('tbody');

    return {
      update: function(state){
        var filter = state.filter;
        var transactions = state.journal.transactions(function(t){
          return balanceFilterHelper.transactionMatchesFilter(t, filter);
        }) || [];

        var rows = [];
        transactions.forEach(function(t){
          var mp = balanceFilterHelper.matchingPostings(t, filter);
          var total = new Big(0.0);
          mp.forEach(function(p){ total = total.add(p.amount); });
          var comments = transactionComments(t);

          rows.push(
            '<tr>' +
              '<td>' + escapeHtml(t.date.year + '/' + t.date.month + '/' + t.date.day) +
                ' [' + weekNumber(t) + ']</td>' +
              '<td>' + escapeHtml(formatHelper.formattedAmount(total)) + '</td>' +
              '<td><i>' + escapeHtml(t.payee) + '</i></td>' +
              '<td>' + (mp.length == 1 ? escapeHtml(accountNameHelper.encodeAccountName(mp[0].account)) : '') + '</td>' +
              '<td>' + (comments.length > 0
                  ? '<i class="fa fa-comment-o text-muted" style="cursor: help" title="' +
                    escapeHtml(comments.join('\n')) + '"></i>'
                  : '') + '</td>' +
            '</tr>');

          if(mp.length > 1){
            mp.forEach(function(p){
              rows.push(
                '<tr><td></td>' +
                  '<td style="font-size: smaller">' + escapeHtml(formatHelper.formattedAmount(p.amount)) + '</td>' +
                  '<td></td>' +
                  '<td>' + escapeHtml(accountNameHelper.encodeAccountName(p.account)) + '</td>' +
                  '<td></td></tr>');
            });
          }
        });
        tbody.innerHTML = rows.join('');
      }
    };
  }
};