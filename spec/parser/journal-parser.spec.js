describe("Ledger Parser", function() {

  var fs = require('fs');
  var parser = require('../../src/parser/journal-parser.js');

  it("should be able to parse empty lines", function() {
    var result = parser.reset("").next();
    expect(result).toBeUndefined();

    var result = parser.reset("\n").next();
    expect(result).toBeUndefined();

    var result = parser.reset("\n\n\n\r\n").next();
    expect(result).toBeUndefined();

    var result = parser.reset("    \n    \r\n").next();
    expect(result).toBeUndefined();
  });

  const expectedChunk001_01 = {
    type: 'transaction',
    date: { year: 2010, month: 5, day: 31 },
    payee: 'An income transaction',
    posting: [
      {account: [ 'Assets', 'Checking'], currency: '$', amount: 1000.00 },
      {account: [ 'Income', 'Salary']}
    ]
  };

  const expectedChunk001_02 = {
    type: 'transaction',
    date: { year: 2010, month: 5, day: 31 },
    payee: 'An expense transaction',
    posting: [
      {account: [ 'Expenses', 'Dining'], currency: '$', amount: 100.00 },
      {account: [ 'Assets', 'Checking']}
    ]
  };

  it("should be able to parse transaction chunks", function() {
     var file = fs.readFileSync('spec/resources/001 ledger.journal', 'utf8');

     var result = parser.reset(file).next();
     expect(result).toEqual(expectedChunk001_01);

     var result = parser.next();
     expect(result).toEqual(expectedChunk001_02);

     expect(parser.next()).toBeUndefined();
  });

  it("should be able to parse transaction from file with multiple empty lines", function() {
     var file = fs.readFileSync('spec/resources/001 ledger with empty lines.journal', 'utf8');

     var result = parser.reset(file).next();
     expect(result).toEqual(expectedChunk001_01);

     var result = parser.next();
     expect(result).toEqual(expectedChunk001_02);

     expect(parser.next()).toBeUndefined();
  });

  it("should fail on invalid format and report failure details on first line", function() {
    try{
      var data = '1234';
      parser.reset(data).next();
      fail('Did not throw exception');
    }catch(e){
      expect(e.chunk.line).toEqual(1);
      expect(e.chunk.value).toEqual(data);
      expect(e.message).toEqual(e.cause.message);
    }
  });

  it("should fail on invalid format and report failure details on first line", function() {
    try{
      var data = ' abcd';
      var input = '\n\n\n' + data;
      parser.reset(input).next();
      fail('Did not throw exception');
    }catch(e){
      expect(e.chunk.line).toEqual(4);
      expect(e.chunk.value).toEqual(data);
      expect(e.message).toEqual(e.cause.message);
    }
  });
})