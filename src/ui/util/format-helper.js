module.exports = {

  formattedAmount: function(v){
    let value = v == null || v.toFixed == null ? 0.00 : v.toFixed(2);
    return parseFloat(value).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
  },
};