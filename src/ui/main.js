var parser = require('../../src/parser/journal-parser');
var journal = require('../../src/journal');
var sampleGenerator = require('../../generator/generator.util');

var Vue = require('vue');
require('./components/accounts.js');
require('./components/account-filter.js');
require('./components/total-monthly-chart.js');
require('./components/monthly-chart.js');
require('./components/weekly-chart.js');
require('./components/transaction-table.js');

var app = new Vue({
  el: '#app',
  data: {
    filter:  {
      account: 'Expenses',
      month: new Date().getMonth() + 1,
      payee: '',
      tag: ''
    },
    journal: journal,
    redraw: false,
    currentFile: null,
    currentFileHandle: null,
    showReloaded: false,
    supportsFileSystemAccess: typeof window.showOpenFilePicker === 'function',
  },
  beforeMount: function(){
      var self = this;
      var text = sampleGenerator.generateYearJournal();
      this.createJournal(text);
  },
  mounted(){
    $(this.$refs.accordion).on("show.bs.collapse", this.collapsedGraph)
    $(this.$refs.tabs).on("shown.bs.tab", this.collapsedGraph)
  },
  methods: {

    openFile: async function(){
      if(typeof window.showOpenFilePicker === 'function'){
        try{
          const [handle] = await window.showOpenFilePicker();
          this.currentFileHandle = handle;
          const file = await handle.getFile();
          this.currentFile = file;
          this.readFile(file);
        }catch(err){
          if(err.name !== 'AbortError'){
            console.log(err);
          }
        }
      } else {
        this.$refs.fileInput.click();
      }
    },

    handleFiles : function(e) {
      var files = e.currentTarget.files;
      if(files == null || files.length === 0){
        return;
      }
      this.currentFileHandle = null;
      this.currentFile = files[0];
      this.readFile(this.currentFile);
      if(this.reloadPending){
        this.reloadPending = false;
        this.flashReloaded();
      }
    },

    reloadFile : async function(){
      if(this.currentFileHandle != null){
        try{
          const file = await this.currentFileHandle.getFile();
          this.currentFile = file;
          this.readFile(file);
          this.flashReloaded();
        }catch(err){
          console.log(err);
          $('#errors').text('Could not re-read the file from disk. It may have been moved or deleted.');
        }
        return;
      }

      if(this.currentFile != null){
        this.reloadPending = true;
        await this.openFile();
      }
    },

    reloadFileFromFooter: async function(){
      await this.reloadFile();
      await Vue.nextTick();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
      $('#footer-reloaded').removeClass('d-none');
      var self = this;
      clearTimeout(this.footerReloadedTimeout);
      this.footerReloadedTimeout = setTimeout(function(){
        $('#footer-reloaded').addClass('d-none');
      }, 2000);
    },

    readFile : function(file){
      var reader = new FileReader();
      var self = this;

      reader.onload = function(e) {
          var text = reader.result
          self.createJournal(text);
      }
      reader.onerror = function(err) {
          console.log(err, err.loaded, err.loaded === 0);
      }
      reader.readAsText(file);
    },

    flashReloaded: function(){
      clearTimeout(this.reloadedTimeout);
      this.showReloaded = true;
      var self = this;
      this.reloadedTimeout = setTimeout(function(){
        self.showReloaded = false;
      }, 2000);
    },

    createJournal: function(text){
      this.setSource(text);
      $('#errors').text('');
      journal.reset();

      parser.reset(text)
      var chunk;
      try{
        while((chunk = parser.next()) != null){
          journal.add(chunk);
        }

        $('#topTab a[href="#transactions"]').tab('show');
      }catch(e){
        if(e.chunk == null){
          $('#errors').text('Error: ' + e.message + JSON.stringify(e, null, 2));
        } else {
          $('#errors').text('Failing on line ' + JSON.stringify(e.chunk, null, 2));
        }
        console.log(e);
      }
    },

    setSource: function(text){
      Vue.nextTick(function () {
        $('#file-contents').text(text);
      });
    },

    updateFilterAccount: function(account){
      this.filter.account = account;
    },

    collapsedGraph: function(){
      this.redraw = !this.redraw;
    }
  },
})

window.app = app;