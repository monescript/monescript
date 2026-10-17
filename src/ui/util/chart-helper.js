var c3 = require('c3');

module.exports = {
  MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  // A bar chart that is only drawn when its container is visible (has a width),
  // and resized when that width changes.
  lazyBarChart: function(selector){
    var el = document.querySelector(selector);
    var latest = null;     // newest {columns, categories}
    var dirty = false;     // latest data not yet drawn
    var chart = null;
    var drawnWidth = 0;

    function draw(){
      if(latest == null || el.clientWidth === 0){
        return;
      }
      chart = c3.generate({
        bindto: selector,
        transition: { duration: 0 },
        data: { columns: latest.columns, labels: true, type: 'bar' },
        bar: { width: { ratio: 0.9 } },
        axis: { x: { type: 'category', categories: latest.categories } }
      });
      drawnWidth = el.clientWidth;
      dirty = false;
    }

    new ResizeObserver(function(){
      var width = el.clientWidth;
      if(width === 0){
        return;                       // hidden: wait until it is shown
      }
      if(dirty){
        draw();                       // data changed while hidden
      } else if(chart != null && width !== drawnWidth){
        chart.resize();               // real width change only
        drawnWidth = width;
      }
    }).observe(el);

    return {
      show: function(columns, categories){
        latest = { columns: columns, categories: categories };
        dirty = true;
        draw();                       // draws now if visible, otherwise the observer does it later
      }
    };
  }
};