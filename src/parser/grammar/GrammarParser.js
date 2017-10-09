function GrammarParser() {
  var peg = require("pegjs");
  var fs = require('fs');
  var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');
  this.parser = peg.generate(cliGrammar);
}

GrammarParser.prototype = {
  parse: function(value){
    return this.parser.parse(value);
  }
}

module.exports = new GrammarParser();