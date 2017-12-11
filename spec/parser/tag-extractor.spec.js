describe("Tag Extractor", function() {
  var tagExtractor = require("../../src/parser/tag-extractor.js");

/*
https://www.ledger-cli.org/3.0/doc/ledger3.html#Metadata-tags

To tag an item, put any word not containing whitespace between two colons inside a comment:
  :TAG:

You can gang up multiple tags by sharing colons:
   :TAG1:TAG2:TAG3:

https://www.ledger-cli.org/3.0/doc/ledger3.html#Metadata-values

To associate a value with a tag, use the syntax “Key: Value”, where the value can be any string of characters. Whitespace is needed after the colon, and cannot appear in the Key:
*/
  it("returns nothing for null", function() {
    let tags = tagExtractor.extractTags();
    expect(tags).toEqual([]);
  });

  it("returns nothing for empty", function() {
    let tags = tagExtractor.extractTags(
      " "
    );
    expect(tags).toEqual([]);
  });

  it("returns nothing if there are no tags", function() {
    let tags = tagExtractor.extractTags(
      " abcd "
    );
    expect(tags).toEqual([]);
  });

  it("returns no value tag with single colon", function() {
    let tags = tagExtractor.extractTags(
      "abcd:"
    );
    expect(tags).toEqual( [{ 'abcd': ''} ]);
  });

  it("returns no value tag with colons around it", function() {
    let tags = tagExtractor.extractTags(
      ":abcd:"
    );
    expect(tags).toEqual( [{ 'abcd': ''} ]);
  });

  it("returns multiple tags with colons around them", function() {
    let tags = tagExtractor.extractTags(
      ":abcd:efg:tag1:TAG2"
    );
    expect(tags).toEqual( [
      { 'abcd': ''},
      { 'efg': ''},
      { 'tag1': ''},
      { 'TAG2': ''},
    ]);
  });

  it("returns tag with a value", function() {
    let tags = tagExtractor.extractTags(
      "abcd: efgh ijk lmn op"
    );
    expect(tags).toEqual([{'abcd':'efgh ijk lmn op'}]);
  });

  it("trims tag key", function() {
    let tags = tagExtractor.extractTags(
      "  abcd: efgh"
    );
    expect(tags).toEqual([{'abcd':'efgh'}]);
  });
})