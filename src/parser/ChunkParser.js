function ChunkParser() {

  var rules = {
    data:  {match:/(?:.+(?:\n|\r\n|\r)?)+/, lineBreaks: true},
    emptyLines:  { match: /\n+|(?:\r\n)+|\r+/, lineBreaks: true },
  };

  var moo = require('moo');
  this.lexer = moo.compile(rules);
}

ChunkParser.prototype = {
  reset: function(value){
     this.lexer.reset(value);
  },
  next: function(){
    return this.lexer.next();
  }
}

module.exports = new ChunkParser();