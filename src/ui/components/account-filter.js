var MONTHS = ['All', 'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];

function val(v){ return v == null ? '' : v; }

module.exports = {
  create: function(root, state, onChange){
    var options = MONTHS.map(function(name, i){
      return '<option value="' + i + '">' + name + '</option>';
    }).join('');

    root.innerHTML =
      '<div class="form-inline mb-2">' +
        '<label class="mr-2">Account: </label>' +
        '<input class="form-control" type="text" data-field="account" placeholder="Expenses"/>' +
        '<label class="ml-3 mr-2">Month: </label>' +
        '<select class="form-control" data-field="month">' + options + '</select>' +
        '<label class="ml-3 mr-2">Payee: </label>' +
        '<div class="input-group mb-2 mr-sm-2 mb-sm-0"><div class="input-group-addon">@</div>' +
          '<input class="form-control" type="text" data-field="payee" placeholder="Giant Moose"/></div>' +
        '<label class="ml-3 mr-2">Tag: </label>' +
        '<div class="input-group mb-2 mr-sm-2 mb-sm-0">' +
          '<input class="form-control" type="text" data-field="tag" placeholder="bicycle"/></div>' +
      '</div>';

    var fields = {};
    Array.prototype.forEach.call(root.querySelectorAll('[data-field]'), function(el){
      fields[el.getAttribute('data-field')] = el;
    });

    // 'change' (not 'input') matches the old v-model.lazy behaviour
    root.addEventListener('change', function(e){
      var field = e.target.getAttribute('data-field');
      if(field == null) return;
      state.filter[field] = e.target.value;
      onChange();
    });

    return {
      update: function(s){
        fields.account.value = val(s.filter.account);
        fields.month.value = s.filter.month == null ? '0' : String(s.filter.month);
        fields.payee.value = val(s.filter.payee);
        fields.tag.value = val(s.filter.tag);
      }
    };
  }
};