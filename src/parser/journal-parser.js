var LedgerParser = {
  chunks: require('./chunk-parser.js'),
  grammar: require('./grammar-parser'),

  reset: function(value){
     this.chunks.reset(value);
     return this;
  },

  next: function(){
    var chunk;
    try{
      while((chunk = this.chunks.next()) != null){
        if(chunk.type == 'error')
          throw new Error('Chunk parsing error');

        if(chunk.type != 'data')
          continue;

        return this.grammar.parse(chunk.value);
      }
      return undefined;
    }catch(e){
      var error = {};
      error.message = e.message;
      error.cause = e;
      error.chunk = chunk;
      throw error;
    }
  }
}

module.exports = LedgerParser;