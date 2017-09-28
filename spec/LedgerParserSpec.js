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

      ; # % | *
          A line beginning with a semicolon, pound, percent, bar or asterisk indicates a comment, and is ignored. Comments will not be returned in a “print” response.

      indented ;

          If the semicolon is indented and occurs inside a transaction, it is parsed as a persistent note for its preceding category. These notes or tags
          can be used to augment the reporting and filtering capabilities of Ledger.


  */

  it("should be able to parse a simple transaction", function() {

    var result = this.parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('!');
    expect(result.payee).toEqual('Payee Name 1234');
    expect(result.posting.length).toEqual(1);
    verifyFirstPosting(result);
  });

  it("should be able to parse a transaction with two postings", function() {

    var result = this.parser.parse(
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  $-1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('*');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(2);
    verifyFirstPosting(result);
    verifySecondPosting(result);
  });

  it("should be able to parse a transaction with header comment", function() {
    var result = this.parser.parse(
      "; First phone bill \n" +
      "2016/08/23 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('*');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(1);
    verifyFirstPosting(result);
  });

  it("should be able to parse a transaction with full posting comment", function() {
    var result = this.parser.parse(
      "2016/08/23 other\n" +
      " ;First phone bill\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    verifyDate(result);
    expect(result.status).toEqual('');
    expect(result.payee).toEqual('other');
    expect(result.posting.length).toEqual(2);
    expect(result.posting[0].isComment).toEqual(true);
    expect(result.posting[0].text).toEqual('First phone bill');
    verifyPhonePosting(result, 1);
  });

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
    expect(result.posting[1].account.length).toEqual(4);
    expect(result.posting[1].account[0]).toEqual('Assets');
    expect(result.posting[1].account[1]).toEqual('The Country');
    expect(result.posting[1].account[2]).toEqual('Bank One');
    expect(result.posting[1].account[3]).toEqual('Account Two');
    expect(result.posting[1].amount).toEqual(-1234.56);
    expect(result.posting[1].currency).toEqual('$');
  }

  var verifyDate = function(result){
    expect(result.date.year).toEqual(2016);
    expect(result.date.month).toEqual(8);
    expect(result.date.day).toEqual(23);
  }
});
