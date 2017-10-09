function ChunkParser() {

  var rules = {
    emptyLines:  { match: /(?:\s*(?:\n+|(?:\r\n)+|\r+)+)+/, lineBreaks: true },
    data:  {match:/(?:.+(?:\n|\r\n|\r)?)+/, lineBreaks: true},
  };

  var moo = require('moo');
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