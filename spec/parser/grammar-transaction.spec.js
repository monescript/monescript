describe("Ledger Grammar Parser", function() {
  var parser = require("../../src/parser/grammar-parser.js");

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

------------------------------------------------------------------------------------------------------------------------------------

  From: http://ledger-cli.org/3.0/doc/ledger3.html#Resetting-a-balance


  */

  const expectedSimpleTransaction = {
    type: 'transaction',
    date: { year: 2016, month: 8, day: 23 },
    status: '!',
    payee: 'Payee Name 1234',
    posting: [{account: [ 'Expenses', 'Utilities', 'Phone 1' ], currency: '$', amount: 1234.56 }]
  };

  it("should be able to parse a simple transaction", function() {
    var result = parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1234.56"
    );

    expect(result).toEqual(expectedSimpleTransaction);
  });

  it("should be able to parse a simple transaction with spaces and dos newlines", function() {
    var result = parser.parse(
      "2016/08/23    !     Payee Name 1234\r\n"
      + "       Expenses:Utilities:Phone 1       $1234.56\n"
    );

    expect(result).toEqual(expectedSimpleTransaction);
  });

  it("should be able to parse a simple transaction with spaces after payee name", function() {
    var result = parser.parse(
      "2016/08/23    !     Payee Name 1234     \r\n"
      + "       Expenses:Utilities:Phone 1       $1234.56\n"
    );

    expect(result).toEqual(expectedSimpleTransaction);
  });

  it("should be able to parse a simple transaction with thousands separator", function() {
    var result = parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Utilities:Phone 1  $1,234.56"
    );
    expect(result).toEqual(expectedSimpleTransaction);
  });

  it("should be able to parse a simple transaction with long posting account", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [{account: [ 'Expenses', 'Bills', 'Utilities', 'Abc def ghi'], currency: '$', amount: 27.6}]
    };

    var result = parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Expenses:Bills:Utilities:Abc def ghi   $27.60"
    );

    expect(result).toEqual(expectedTransaction);
  });


  it("should be able to parse a transaction with two postings", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2016, month: 10, day: 12 },
      status: '*',
      payee: 'other',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56},
        {account: [ 'Assets', 'The Country', 'Bank One', 'Account Two'], currency: '$', amount: -1234.56}
      ]
    };

    var result = parser.parse(
      "2016/10/12 * other\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  $-1234.56"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a simple transaction with balance assignment", function() {
    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      status: '!',
      payee: 'Payee Name 1234',
      posting: [
        {account: [ 'Assets', 'Cash'], currency: '$', amount: 27.6, assignment: true},
        {account: [ 'Bssets', 'Bank2', 'Checking'], currency: '$', amount: 560.12, assignment: true}
      ]
    };

    var result = parser.parse(
      "2016/08/23 ! Payee Name 1234\n"
      + " Assets:Cash    =$27.60\n"
      + " Bssets:Bank2:Checking   =   $560.12"
    );
    expect(result).toEqual(expectedTransaction);
  });


  it("should be able to parse a transaction with two postings, one without amount", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 1, day: 15 },
      payee: 'other payee value',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56},
        {account: [ 'Assets', 'The Country', 'Bank One', 'Account Two']}
      ]
    };

    var result = parser.parse(
      "2017/01/15     other payee value    \n" +
      " Expenses:Utilities:Phone 1  $1234.56\n" +
      " Assets:The Country:Bank One:Account Two  "
    );

    expect(result).toEqual(expectedTransaction);

    var result = parser.parse(
      "2017/01/15          other payee value\r" +
      " Expenses:Utilities:Phone 1  $1234.56   \r" +
      " Assets:The Country:Bank One:Account Two\r"
    );

    expect(result).toEqual(expectedTransaction);

  });

  it("should be able to parse a transaction with header transaction note", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other',
      status: '*',
      note: ' First phone bill',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56}
      ]
    };

    var result = parser.parse(
      "2017/11/29 * other  ; First phone bill\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction without header transaction note - no hard separator before comment character", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other ;  payee notes',
      status: '*',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56}
      ]
    };

    var result = parser.parse(
      "2017/11/29 * other ;  payee notes\n" +
      " Expenses:Utilities:Phone 1  $1234.56\n"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction with empty header transaction note", function() {

    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other',
      note: '',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56}
      ]
    };

    var result = parser.parse(
      "2017/11/29 other  ;\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction with full posting comment", function() {
    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other',
      posting: [
        {type: 'comment', text: 'First phone bill'},
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56}
      ]
    };
    var result = parser.parse(
      "2017/11/29 other\n" +
      " ;First phone bill\n" +
      " Expenses:Utilities:Phone 1  $1234.56"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction with posting note", function() {
    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56, note: ' second bill'}
      ]
    };

    var result = parser.parse(
      "2017/11/29 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56 ; second bill"
    );

    expect(result).toEqual(expectedTransaction);
  });


  it("should be able to parse a transaction with posting note without space", function() {
    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2017, month: 11, day: 29 },
      payee: 'other',
      posting: [
        {account: [ 'Expenses', 'Utilities', 'Phone 1'], currency: '$', amount: 1234.56, note: 'second bill'}
      ]
    };

    var result = parser.parse(
      "2017/11/29 other\n" +
      " Expenses:Utilities:Phone 1  $1234.56;second bill"
    );

    expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction with braces around amount", function() {
      const expectedTransaction = {
        type: 'transaction',
        date: { year: 2016, month: 8, day: 23 },
        payee: 'other',
        posting: [
          {
            account: [ 'Expenses', 'Utilities', 'Phone 1'], amount: {type: 'Literal', currency: '$', amount: 1234.56}
          }
        ]
      };

      var result = parser.parse(
        "2016/08/23 other\n" +
        " Expenses:Utilities:Phone 1  ($1234.56)"
      );

      expect(result).toEqual(expectedTransaction);
  });

  it("should be able to parse a transaction with braces around negative amount", function() {
      const expectedTransaction = {
        type: 'transaction',
        date: { year: 2016, month: 8, day: 23 },
        payee: 'other',
        posting: [
          {
            account: [ 'Expenses', 'Utilities', 'Phone 1'], amount: {type: 'Literal', currency: '$', amount: -1234.56}
          }
        ]
      };

      var result = parser.parse(
        "2016/08/23 other\n" +
        " Expenses:Utilities:Phone 1  ($-1234.56)"
      );

      expect(result).toEqual(expectedTransaction);
    });

/*
  http://ledger-cli.org/3.0/doc/ledger3.html#Value-Expressions
*/

  it("should be able to parse a transaction with value expression in amount", function() {
    const expectedTransaction = {
      type: 'transaction',
      date: { year: 2016, month: 8, day: 23 },
      payee: 'other',
      posting: [
        {
          account: [ 'Expenses', 'Utilities', 'Phone 1'],
          amount: {
            type: 'BinaryExpression',
            operator: '-',
            left: {
              type: 'BinaryExpression',
              operator: '+',
              left: {
                type: 'BinaryExpression',
                operator: '*',
                left: { currency: '$', amount: 1234.56, type: 'Literal' },
                right: 1.2
              },
              right: {
                  type: 'BinaryExpression',
                  operator: '-',
                  left: { currency: '$', amount: 56, type: 'Literal' },
                  right: { currency: '$', amount: 134, type: 'Literal' }
              }
            },
            right: { currency: '$', amount: 0, type: 'Literal' }
          },
          note: ' second bill'
        }
      ]
    };

    var result = parser.parse(
      "2016/08/23 other\n" +
      " Expenses:Utilities:Phone 1  ($1234.56 * 1.2 + ($56 -  $134) - $0) ; second bill"
    );

    expect(result).toEqual(expectedTransaction);
  });
});
