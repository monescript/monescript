function GrammarParser() {
  this.parser = require("../resources/ledger-cli")
}

GrammarParser.prototype = {
  parse: function(value){
    return this.parser.parse(value);
  }
}

module.exports = new GrammarParser();