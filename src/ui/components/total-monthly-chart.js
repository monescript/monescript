var chartHelper = require('../util/chart-helper');
var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');

module.exports = {
  create: function(root){
    root.innerHTML =
      '<div class="row"><div class="col-12">' +
        '<div class="row"><div class="col-12"><div id="total-monthly-chart-plot" style="height: 200px;"></div></div></div>' +
        '<div class="row"><div class="col-12 ml-2">' +
          '<label class="mr-3">Total Income: <span data-total-income></span></label>' +
          '<label class="mr-3">Total Expenses: <span data-total-expenses></span></label>' +
          '<label class="mr-3">Average Monthly Income: <span data-avg-income></span></label>' +
          '<label class="mr-3">Average Monthly Expenses: <span data-avg-expenses></span></label>' +
        '</div></div>' +
      '</div></div>';
    var el = function(name){ return root.querySelector('[data-' + name + ']'); };
    var totalIncomeEl = el('total-income'), totalExpensesEl = el('total-expenses');
    var avgIncomeEl = el('avg-income'), avgExpensesEl = el('avg-expenses');
    var chart = chartHelper.lazyBarChart('#total-monthly-chart-plot');

    return {
      update: function(state){
        var journal = state.journal;
        var dataExpense = ['Expense'];
        var dataIncome = ['Income'];
        for(var i = 1; i <= 12; ++i){
          dataExpense.push(Math.abs(balanceFilterHelper.filteredMonthlyBalance(journal, { account: 'Expense', month: i })));
          dataIncome.push(Math.abs(balanceFilterHelper.filteredMonthlyBalance(journal, { account: 'Income', month: i })));
        }
        var monthCount = journal.getTransactionMonthCount();
        var income = balanceFilterHelper.totalBalance(journal, 'Income:');
        var expenses = balanceFilterHelper.totalBalance(journal, 'Expenses:');

        totalIncomeEl.textContent = formatHelper.formattedAmount(income);
        totalExpensesEl.textContent = formatHelper.formattedAmount(expenses);
        avgIncomeEl.textContent = formatHelper.formattedAmount(income / monthCount);
        avgExpensesEl.textContent = formatHelper.formattedAmount(expenses / monthCount);
        chart.show([dataExpense, dataIncome], chartHelper.MONTHS);
      }
    };
  }
};