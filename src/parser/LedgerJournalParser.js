var LedgerParser = {
  chunks: require('./ChunkParser.js'),
  grammar: require('./GrammarParser'),

  reset: function(value){
     this.chunks.reset(value);
     return this;
  },

  next: function(){

    var chunk;
    while((chunk = this.chunks.next()) != null){
      if(chunk.type != 'data')
        continue;
      return this.grammar.parse(chunk.value);
    }
    return undefined;
  }
}

module.exports = LedgerParser;