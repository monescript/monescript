describe("Account name helper", function() {
  let nameFilter = require('../../../src/ui/util/account-name-helper');
  let Big = require('big.js');

  describe("filter()", function() {
    it("returns nothing for empty", function() {
      expect(nameFilter.filter('', {})).toEqual([]);
    });

    it("returns all for empty filter", function() {
        let expenses = {'Expenses': {account: ['Expenses' ], currency: '$', balance: Big(1234.56)}};
        let assets = {'Assets': {account: ['Assets' ], currency: '$', balance: Big(1234.56)}};
        let accounts = Object.assign({}, expenses, assets);
        let expectedValue = Array.of(expenses.Expenses, assets.Assets);

        expect(nameFilter.filter('', accounts)).toEqual(expectedValue);
    });

    it("returns only matching filter case insensitive", function() {
        let expenses = {'Expenses': {account: ['Expenses' ], currency: '$', balance: Big(1234.56)}};
        let assets = {'Assets': {account: ['Assets' ], currency: '$', balance: Big(1234.56)}};
        let accounts = Object.assign({}, expenses, assets);
        let expectedValue = Array.of(expenses.Expenses);

        expect(nameFilter.filter('Expenses', accounts)).toEqual(expectedValue);
        expect(nameFilter.filter('exp', accounts)).toEqual(expectedValue);
        expect(nameFilter.filter('xpens', accounts)).toEqual(expectedValue);
    });

    it("returns parent accounts as well", function() {
        let expenses = {'Expenses': {account: ['Expenses' ], currency: '$', balance: Big(1234.56)}};
        let utils = {'Expenses:Utilities': {account: ['Expenses', 'Utilities' ], currency: '$', balance: Big(1234.56)}};
        let assets = {'Assets': {account: ['Assets' ], currency: '$', balance: Big(1234.56)}};
        let accounts = Object.assign({}, expenses, utils, assets);

        let expectedValue = Array.of(expenses.Expenses, utils['Expenses:Utilities']);

        expect(nameFilter.filter('util', accounts)).toEqual(expectedValue);
    });

    it("does not return sibling accounts", function() {
        let expenses = {'Expenses': {account: ['Expenses' ], currency: '$', balance: Big(1234.56)}};
        let clothing = {'Expenses:Clothing': {account: ['Expenses', 'Clothing' ], currency: '$', balance: Big(1234.56)}};
        let grocery = {'Expenses:Grocery': {account: ['Expenses', 'Grocery' ], currency: '$', balance: Big(1234.56)}};
        let assets = {'Assets': {account: ['Assets' ], currency: '$', balance: Big(1234.56)}};
        let accounts = Object.assign({}, expenses, clothing, grocery, assets);

        let expectedValue = Array.of(expenses.Expenses, clothing['Expenses:Clothing']);

        expect(nameFilter.filter('clothing', accounts)).toEqual(expectedValue);
    });
  })
});