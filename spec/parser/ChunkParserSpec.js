describe("Chunk Parser", function() {

  var fs = require('fs');
  var cp = require('../../src/parser/ChunkParser.js');

  it("should be able to parse empty lines", function() {
     expect(cp.reset('').next()).toBeUndefined();

     var result = cp.reset('\n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('\r\n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('\r').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('\r\n\r\n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

  });

  it("should be able to parse multiple empty lines", function() {
     expect(cp.reset('').next()).toBeUndefined();

     var result = cp.reset('\n\n\n\n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('\r\n\r\n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('\r\r\r').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();
  });

  it("should be able to parse empty lines with spaces", function() {
     expect(cp.reset('').next()).toBeUndefined();

     var result = cp.reset('   \n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('   \n \t\n           \n   \n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();

     var result = cp.reset('   \r\n \t\n     \r\r\r      \r\n   \n').next()
     expect(result.type).toEqual('emptyLines');
     expect(cp.next()).toBeUndefined();
  });

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
     expect(chunk02.type).toEqual('data');
     expect(chunk02.value).toEqual(part02);
  });
})