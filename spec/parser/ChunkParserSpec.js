describe("Chunk Parser", function() {

  var fs = require('fs');
  var cp = require('../../src/parser/ChunkParser.js');

  it("should be able to parse transaction chunks", function() {

     var file = fs.readFileSync('spec/resources/001 ledger.journal', 'utf8');
     var part01 = fs.readFileSync('spec/resources/001.01 ledger.journal', 'utf8');
     var part02 = fs.readFileSync('spec/resources/001.02 ledger.journal', 'utf8');

     cp.reset(file)
     var chunk01 = cp.next()
     expect(chunk01.type).toEqual('data');
     expect(chunk01.value).toEqual(part01);

     var nonChunk = cp.next();
     expect(nonChunk.type).toEqual('emptyLines');

     var chunk02 = cp.next()
     //console.log(JSON.stringify(chunk02))
     expect(chunk02.type).toEqual('data');
     expect(chunk02.value).toEqual(part02);
  });
})