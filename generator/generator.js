let g = require('./generator.util')

for(let i = 1; i <= 30; i++){
  let t = g.transactionsDay(2017, 10, i);
  console.log(t);
}