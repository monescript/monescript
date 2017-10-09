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
      try{
        return this.grammar.parse(chunk.value);
      }catch(e){
        var error = new Error();
        error.message = e.message;
        error.cause = e;
        error.chunk = chunk;
        throw error;
      }
    }
    return undefined;
  }
}

module.exports = LedgerParser;