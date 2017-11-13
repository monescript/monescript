describe("Account name helper", function() {
  let nameHelper = require('../../../src/ui/util/account-name-helper');

  describe("encodeAccountName()", function() {
    it("returns nothing for empty", function() {
      expect(nameHelper.encodeAccountName([])).toEqual('');
    });

    it("returns account name for single element", function() {
      expect(nameHelper.encodeAccountName(['abc'])).toEqual('abc');
    });

    it("returns account joined with colon", function() {
      expect(nameHelper.encodeAccountName(['abc', 'def', 'ghij'])).toEqual('abc:def:ghij');
    });
  })

  describe("accountMatches()", function() {
    it("calls underlying methods", function() {

      let account = ['abc', 'def'];
      let filter = 'ghi';
      let encodeAccountName = 'encoded';
      let matchValue = true;

      spyOn(nameHelper, 'nameMatches').and.returnValue(matchValue);
      spyOn(nameHelper, 'encodeAccountName').and.returnValue(encodeAccountName);

      let retVal = nameHelper.accountMatches(account, filter);

      expect(nameHelper.encodeAccountName).toHaveBeenCalledWith(account);
      expect(nameHelper.nameMatches).toHaveBeenCalledWith(encodeAccountName, filter);
      expect(retVal).toEqual(matchValue);
    });
  })

  describe("nameMatches()", function() {
    it("matches empty", function() {
      expect(nameHelper.nameMatches('account', '')).toBeTruthy();
    });

    it("matches self", function() {
      expect(nameHelper.nameMatches('account', 'account')).toBeTruthy();
    });

    it("matches sub string", function() {
      expect(nameHelper.nameMatches('account', 'acc')).toBeTruthy();
    });

    it("matches case insensitive", function() {
      expect(nameHelper.nameMatches('My:Bank:Account', 'BANK')).toBeTruthy();
    });

    it("does not match non-sub string", function() {
      expect(nameHelper.nameMatches('account', 'abc')).toBeFalsy();
    });
  })

});