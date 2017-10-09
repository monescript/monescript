function ChunkParser() {

  var moo = require('moo');
  var rules = {
    emptyLines:  { match: /(?:\s*(?:\n+|(?:\r\n)+|\r+)+)+/, lineBreaks: true },
    data:  {match:/^[a-z0-9].+(?:\n|\r\n|\r)?(?:[ \t]+.+(?:\n|\r\n|\r)?)*/, lineBreaks: true},
    error: moo.error,
  };

  this.lexer = moo.compile(rules);
}

ChunkParser.prototype = {
  reset: function(value){
     this.lexer.reset(value);
     return this;
  },
  next: function(){
    return this.lexer.next();
  }
}

module.exports = new ChunkParser();