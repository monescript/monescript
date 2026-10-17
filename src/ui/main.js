var parser = require('../../src/parser/journal-parser');
var journal = require('../../src/journal');
var sampleGenerator = require('../../generator/generator.util');

var tabs = require('./tabs.js');
var accountFilter = require('./components/account-filter.js');
var accounts = require('./components/accounts.js');
var totalMonthlyChart = require('./components/total-monthly-chart.js');
var monthlyChart = require('./components/monthly-chart.js');
var weeklyChart = require('./components/weekly-chart.js');
var transactionTable = require('./components/transaction-table.js');

var state = {
  filter: {
    account: 'Expenses',
    month: new Date().getMonth() + 1,
    payee: '',
    tag: ''
  },
  journal: journal
};

var currentFile = null;
var currentFileHandle = null;
var afterReload = null;
var flashTimers = {};

function byId(id){ return document.getElementById(id); }

// ---- rendering (replaces Vue's deep watchers) ----

var views = [];

function render(){
  views.forEach(function(v){ v.update(state); });
}

function updateFilterAccount(account){
  state.filter.account = account;
  render();
}

function flash(id){
  var el = byId(id);
  el.classList.remove('d-none');
  clearTimeout(flashTimers[id]);
  flashTimers[id] = setTimeout(function(){ el.classList.add('d-none'); }, 2000);
}

// ---- journal loading ----

function createJournal(text){
  byId('file-contents').textContent = text;
  byId('errors').textContent = '';
  journal.reset();

  parser.reset(text);
  var chunk;
  var ok = true;
  try{
    while((chunk = parser.next()) != null){
      journal.add(chunk);
    }
  }catch(e){
    ok = false;
    if(e.chunk == null){
      byId('errors').textContent = 'Error: ' + e.message + JSON.stringify(e, null, 2);
    } else {
      byId('errors').textContent = 'Failing on line ' + JSON.stringify(e.chunk, null, 2);
    }
    console.log(e);
  }

  render();
  if(ok){
    tabs.show('#transactions');
  }
  tabs.init();
  return ok;
}

async function readFile(file){
  try{
    return createJournal(await file.text());
  }catch(err){
    console.log(err);
    byId('errors').textContent = 'Could not read the file: ' + err.message;
    return false;
  }
}

async function openFile(){
  if(typeof window.showOpenFilePicker === 'function'){
    try{
      var handles = await window.showOpenFilePicker();
      currentFileHandle = handles[0];
      currentFile = await currentFileHandle.getFile();
      await readFile(currentFile);
    }catch(err){
      if(err.name !== 'AbortError'){
        console.log(err);
      }
    }
  } else {
    byId('file-input').click();
  }
}

async function handleFiles(e){
  var input = e.target;
  if(input.files == null || input.files.length === 0){
    return;
  }
  currentFileHandle = null;
  currentFile = input.files[0];
  var ok = await readFile(currentFile);
  input.value = '';   // lets picking the same file again fire 'change' (Firefox reload fallback)
  if(ok && afterReload != null){
    var after = afterReload;
    afterReload = null;
    after();
  }
}

async function reloadFile(after){
  after = after || function(){ flash('reloaded-flash'); };

  if(currentFileHandle != null){
    try{
      currentFile = await currentFileHandle.getFile();
      if(await readFile(currentFile)){
        after();
      }
    }catch(err){
      console.log(err);
      byId('errors').textContent = 'Could not re-read the file from disk. It may have been moved or deleted.';
    }
    return;
  }

  if(currentFile != null){
    afterReload = after;   // no live handle: re-open the picker, finish in handleFiles
    openFile();
  }
}

function reloadFromFooter(){
  return reloadFile(function(){
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
    flash('footer-reloaded');
  });
}

// ---- wiring ----

views = [
  totalMonthlyChart.create(byId('total-monthly-chart')),
  monthlyChart.create(byId('monthly-chart')),
  weeklyChart.create(byId('weekly-chart')),
  accountFilter.create(byId('account-filter'), state, render),
  accounts.create(byId('accounts'), { onAccount: updateFilterAccount }),
  transactionTable.create(byId('transaction-table'))
];

byId('choose-file-btn').addEventListener('click', function(){ afterReload = null; openFile(); });
byId('file-input').addEventListener('change', handleFiles);
byId('reload-btn').addEventListener('click', function(){ reloadFile(); });
byId('footer-reload-btn').addEventListener('click', reloadFromFooter);

Array.prototype.forEach.call(document.querySelectorAll('[data-quick-account]'), function(btn){
  btn.addEventListener('click', function(){
    updateFilterAccount(btn.getAttribute('data-quick-account'));
  });
});

createJournal(sampleGenerator.generateYearJournal());