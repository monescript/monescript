describe("LedgerParser", function() {
  var peg = require("pegjs");
  var fs = require('fs');

  beforeEach(function() {
      var cliGrammar = fs.readFileSync('src/ledger-cli.pegjs', 'utf8');
      this.parser = peg.generate(cliGrammar);
  });

  /*
  From: http://ledger-cli.org/3.0/doc/ledger3.html#Keeping-a-Journal

  The format is very flexible and it isn’t necessary that you indent and space out things exactly as shown.
  The only requirements are that the start of the transaction (the date typically) is at the beginning of the first line of the transaction,
  and the accounts are indented by at least one space. If you omit the leading spaces in the account lines Ledger will generate an error.
  There must be at least two spaces, or a tab, between the amount and the account.
  If you do not have adequate separation between the amount and the account Ledger will give an error and stop calculating.

  ------------------------------------------------------------------------------------------------------------------------------------

  From: http://ledger-cli.org/3.0/doc/ledger3.html#Transactions-and-Comments

  The initial character of each line determines what the line means, and how it should be interpreted. Allowable initial characters are:

  NUMBER

      A line beginning with a number denotes a transaction. It may be followed by any number of lines, each beginning with white-space,
      to denote the transaction’s account postings. The format of the first line is:

      DATE[=EDATE] [*|!] [(CODE)] DESC

      If ‘*’ appears after the date (with optional effective date), it indicates the transaction is “cleared”, which can mean whatever
      the user wants it to mean. If ‘!’ appears after the date, it indicates the transaction is “pending”; i.e., tentatively cleared
      from the user’s point of view, but not yet actually cleared. If a CODE appears in parentheses, it may be used to indicate a check
      number, or the type of the posting. Following these is the payee, or a description of the posting.

      The format of each following posting is:

        ACCOUNT  AMOUNT  [; NOTE]

      The ACCOUNT may be surrounded by parentheses if it is a virtual posting, or square brackets if it is a virtual posting that must balance.
      The AMOUNT can be followed by a per-unit posting cost, by specifying @ AMOUNT, or a complete posting cost with @@ AMOUNT. Lastly, the NOTE may
      specify an actual and/or effective date for the posting by using the syntax [ACTUAL_DATE] or [=EFFECTIVE_DATE] or [ACTUAL_DATE=EFFECTIVE_DATE]
      (see Virtual postings).

      P
          Specifies a historical price for a commodity. These are usually found in a pricing history file (see the --download (-Q) option). The syntax is:

          P DATE SYMBOL PRICE

      =
          An automated transaction. A value expression must appear after the equal sign.

          After this initial line there should be a set of one or more postings, just as if it were a normal transaction. If the amounts of the postings have
          no commodity, they will be applied as multipliers to whichever real posting is matched by the value expression (see Automated Transactions).
      ~
          A periodic transaction. A period expression must appear after the tilde.

          After this initial line there should be a set of one or more postings, just as if it were a normal transaction.


      indented ;

          If the semicolon is indented and occurs inside a transaction, it is parsed as a persistent note for its preceding category. These notes or tags
          can be used to augment the reporting and filtering capabilities of Ledger.


  */

  it("should be able to parse a simple transaction", function() {
    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1234.56"
    );
    verifySimpleTransaction(result);

    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1       $1234.56"
    );
    verifySimpleTransaction(result);

  });

  it("should be able to parse a simple transaction with thousands separator", function() {
    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1,234.56"
    );
    verifySimpleTransaction(result);
  });

  it("should be able to parse a simple transaction with long posting account", function() {
    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Bills:Utilities:Abc def ghi   $27.60"
    );
    expect(result.length).toEqual(1);
    var txn = result[0];

    verifyDate(txn);
    expect(txn.posting.length).toEqual(1);
    expect(txn.posting[0].account.length).toEqual(4);
    expect(txn.posting[0].account[0]).toEqual('Expenses');
    expect(txn.posting[0].account[1]).toEqual('Bills');
    expect(txn.posting[0].account[2]).toEqual('Utilities');
    expect(txn.posting[0].account[3]).toEqual('Abc def ghi');
  });

  it("should be able to parse a transaction with two postings", function() {

    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  $-1234.56"
    );

    expect(result.length).toEqual(1);
    var txn = result[0];

    verifyDate(txn);
    expect(txn.status).toEqual('*');
    expect(txn.payee).toEqual('other');
    expect(txn.posting.length).toEqual(2);
    verifyFirstPosting(txn);
    verifySecondPosting(txn);
  });

  it("should be able to parse a transaction with two postings, one without amount", function() {

    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  "
    );

    verifyEmptyAmountPostingTransaction(result);

    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two"
    );

    verifyEmptyAmountPostingTransaction(result);
  });

  it("should be able to parse a transaction with top level transaction note", function() {
    var result = this.parser.parse(
      "2016/08/23 * other  ; First phone bill\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyTopLevelTransactionNote(result, ' First phone bill');

    var result = this.parser.parse(
      "2016/08/23 * other  ;\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyTopLevelTransactionNote(result, '');
  });


  it("should be able to parse a transaction with full posting comment", function() {
    var result = this.parser.parse(
      "2016/08/23 other\n" +
      " ;First phone bill\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    expect(result.length).toEqual(1);
    var txn = result[0];

    verifyDate(txn);
    expect(txn.status).toEqual('');
    expect(txn.payee).toEqual('other');
    expect(txn.posting.length).toEqual(2);
    expect(txn.posting[0].isComment).toEqual(true);
    expect(txn.posting[0].text).toEqual('First phone bill');
    verifyPhonePosting(txn, 1);
  });

  it("should be able to parse a transaction with posting note", function() {
    var result = this.parser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56 ; second bill"
    );

    expect(result.length).toEqual(1);
    verifyPhoneTransactionWithPostingNote(result[0]);
  });

  it("should be able to parse a transaction with posting note without space", function() {
    var result = this.parser.parse(
      "2016/08/23 other\n" +
      " Expenses:Purchases:Grocery  $55.66; reimburse"
    );

    expect(result.length).toEqual(1);
    expect(result[0].posting[0].note).toEqual(' reimburse');
  });

/*
  http://ledger-cli.org/3.0/doc/ledger3.html#Value-Expressions
*/

  it("should be able to parse a transaction with value expression in amount", function() {
    var result = this.parser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  ($1234.56 * 1.2 + ($56 -  $134) - $0) ; second bill"
    );

    expect(result.length).toEqual(1);
    var txn = result[0];

    expect(txn.posting[0].amount.type).toEqual('BinaryExpression');
  });

 it("should be able to parse multiple transactions and empty lines", function() {
    var result = this.parser.parse(
      "\n" +
      "\n" +
      "\n" +
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56 ; second bill" +
      "\n" +
      "\n" +
      "2016/08/23 ! Company\n" +
      " Assets:Chequing  $5678.91\n" +
      " Income:Salary  " +
      "\n"
    );

    expect(result.length).toEqual(2);

    verifyPhoneTransactionWithPostingNote(result[0]);
    verifyIncomeTransaction(result[1])
  });

  var verifySimpleTransaction = function(result){
      expect(result.length).toEqual(1);
      var txn = result[0];

      verifyDate(txn);
      expect(txn.type).toEqual('transaction');
      expect(txn.status).toEqual('!');
      expect(txn.payee).toEqual('Payee Name 1234');
      expect(txn.posting.length).toEqual(1);
      verifyFirstPosting(txn);
  }

  var verifyEmptyAmountPostingTransaction = function(result){
    expect(result.length).toEqual(1);
    var txn = result[0];

    verifyDate(txn);
    expect(txn.status).toEqual('*');
    expect(txn.payee).toEqual('other');
    expect(txn.posting.length).toEqual(2);
    verifyFirstPosting(txn);
    verifySecondPostingWithoutAmount(txn);
  }

  var verifyTopLevelTransactionNote = function(result, expectedNote){
      expect(result.length).toEqual(1);
      var txn = result[0];

      verifyDate(txn);
      expect(txn.note).toEqual(expectedNote);
      expect(txn.status).toEqual('*');
      expect(txn.payee).toEqual('other');
      expect(txn.posting.length).toEqual(1);
      verifyFirstPosting(txn);
  }


  var verifyIncomeTransaction = function(txn){
    verifyDate(txn);
    expect(txn.status).toEqual('!');
    expect(txn.payee).toEqual('Company');

    expect(txn.posting.length).toEqual(2);

    expect(txn.posting[0].account.length).toEqual(2);
    expect(txn.posting[0].account[0]).toEqual('Assets');
    expect(txn.posting[0].account[1]).toEqual('Chequing');
    expect(txn.posting[0].amount).toEqual(5678.91);
    expect(txn.posting[0].currency).toEqual('$');

    expect(txn.posting[1].account.length).toEqual(2);
    expect(txn.posting[1].account[0]).toEqual('Income');
    expect(txn.posting[1].account[1]).toEqual('Salary');
    expect(txn.posting[1].currency).toBeUndefined();
    expect(txn.posting[1].amount).toBeUndefined();
  }

  var verifyPhoneTransactionWithPostingNote = function(txn){
    verifyDate(txn);
    expect(txn.status).toEqual('');
    expect(txn.payee).toEqual('other');
    expect(txn.posting.length).toEqual(1);
    verifyPhonePosting(txn, 0);
    expect(txn.posting[0].note).toEqual(' second bill');
  }

  var verifyFirstPosting = function(result){
      verifyPhonePosting(result, 0);
  }

  var verifyPhonePosting = function(result, i){
    expect(result.posting[i].account.length).toEqual(3);
    expect(result.posting[i].account[0]).toEqual('Expenses');
    expect(result.posting[i].account[1]).toEqual('Utilities');
    expect(result.posting[i].account[2]).toEqual('Phone 1');
    expect(result.posting[i].amount).toEqual(1234.56);
    expect(result.posting[i].currency).toEqual('$');
  }

  var verifySecondPosting = function(result){
    verifySecondPostingFields(result);
    expect(result.posting[1].currency).toEqual('$');
    expect(result.posting[1].amount).toEqual(-1234.56);
  }

  var verifySecondPostingWithoutAmount = function(result){
    verifySecondPostingFields(result);
    expect(result.posting[1].currency).toBeUndefined();
    expect(result.posting[1].amount).toBeUndefined();
  }

  var verifySecondPostingFields = function(result, amount){
    expect(result.posting[1].account.length).toEqual(4);
    expect(result.posting[1].account[0]).toEqual('Assets');
    expect(result.posting[1].account[1]).toEqual('The Country');
    expect(result.posting[1].account[2]).toEqual('Bank One');
    expect(result.posting[1].account[3]).toEqual('Account Two');

  }

  var verifyDate = function(result){
    expect(result.date.year).toEqual(2016);
    expect(result.date.month).toEqual(8);
    expect(result.date.day).toEqual(23);
  }
});
