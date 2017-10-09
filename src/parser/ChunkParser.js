var ChunkParser = {
  moo : require('moo'),

  rules: {
    data:  {match:/(?:.+(?:\n|\r\n|\r)?)+/, lineBreaks: true},
    emptyLines:  { match: /\n+|(?:\r\n)+|\r+/, lineBreaks: true },
  },

  reset: function(value){
     this.lexer = this.moo.compile(this.rules);
     this.lexer.reset(value);
  },

  next: function(){
    return this.lexer.next();
  }
}

module.exports = ChunkParser;