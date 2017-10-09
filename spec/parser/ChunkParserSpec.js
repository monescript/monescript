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


  it("should be able to parse single command chunks", function() {
     cp.reset('include budget 2017-09.dat\n')
     var chunk01 = cp.next()
     expect(chunk01.type).toEqual('data');
     expect(chunk01.value).toEqual('include budget 2017-09.dat\n');
  });

  it("should be able to parse single transaction chunks", function() {
    var txnText = "2017/11/29 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56 ; second bill"

    cp.reset(txnText);
    var chunk01 = cp.next()
    expect(chunk01.type).toEqual('data');
    expect(chunk01.value).toEqual(txnText);
  });

  it("should be able to parse multiple subsequent command chunks", function() {
     cp.reset(
        "bucket Assets:Checking\n"+
        "include budget 2017-09.dat\n"+
        "year 2017\n"
     );

     var chunk01 = cp.next()
     expect(chunk01.type).toEqual('data');
     expect(chunk01.value).toEqual("bucket Assets:Checking\n");

     var chunk01 = cp.next()
     expect(chunk01.type).toEqual('data');
     expect(chunk01.value).toEqual("include budget 2017-09.dat\n");

     var chunk01 = cp.next()
     expect(chunk01.type).toEqual('data');
     expect(chunk01.value).toEqual("year 2017\n");
  });

  it("should be able to parse multiple subsequent transaction chunks", function() {
    var txn1Text =
      "2017/11/29 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56 ; second bill\n"

    var txn2Text =
      "2017/01/15     other payee value    \n" +
       " Expenses:Utilities:Phone 1  $1234.56\n" +
       " Assets:The Country:Bank One:Account Two  "

    cp.reset(txn1Text + txn2Text);
    var result = cp.next()
    expect(result.type).toEqual('data');
    expect(result.value).toEqual(txn1Text);

    var result = cp.next()
    expect(result.type).toEqual('data');
    expect(result.value).toEqual(txn2Text);
  });

  it("should be able to parse transaction chunks with empty lines in between", function() {
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