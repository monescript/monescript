var chartHelper = require('../util/chart-helper');
var balanceFilterHelper = require('../util/balance-filter-helper');
var formatHelper = require('../util/format-helper');

module.exports = {
  create: function(root){
    root.innerHTML =
      '<div class="row"><div class="col-12">' +
        '<div class="row"><div class="col-12"><div id="weekly-chart-plot" style="height: 200px;"></div></div></div>' +
        '<div class="row"><div class="col-12 ml-2">' +
          '<label class="mr-3">Total: <span data-total></span></label>' +
          '<label class="mr-3">Average: <span data-average></span></label>' +
        '</div></div>' +
      '</div></div>';
    var totalEl = root.querySelector('[data-total]');
    var averageEl = root.querySelector('[data-average]');
    var chart = chartHelper.lazyBarChart('#weekly-chart-plot');

    var weeks = [];
    for(var w = 1; w <= 52; ++w){ weeks.push(w); }

    return {
      update: function(state){
        var data = [state.filter.account];
        var total = 0.0;
        for(var i = 1; i <= 52; ++i){
          var filterCopy = Object.assign({}, state.filter);
          filterCopy.month = undefined;
          filterCopy.week = i;
          var balance = Math.abs(balanceFilterHelper.filteredWeeklyBalance(state.journal, filterCopy));
          data.push(balance);
          total += balance;
        }
        var todayWeek = balanceFilterHelper.getWeekNumber(new Date()).week;
        totalEl.textContent = formatHelper.formattedAmount(total);
        averageEl.textContent = formatHelper.formattedAmount(total / todayWeek);
        chart.show([data], weeks);
      }
    };
  }
};