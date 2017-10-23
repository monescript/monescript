let g = require('./generator.util')

for(let i = 0; i < 100; i++){
  let t = `2017/10/14 * ${g.payee()}\n`;
  for(let p = 0; p < g.count(5); ++p)
    t += `  ${g.expenseAccount()}  $${g.amount(10, 100)}\n`
  t += `  Assets:Bank:Checking\n`
  console.log(t);
}