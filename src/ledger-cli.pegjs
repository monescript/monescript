{

  function buildTree(head, tail, builder) {
    var result = head, i;

    for (i = 0; i < tail.length; i++) {
      result = builder(result, tail[i]);
    }

    return result;
  }

  function buildBinaryExpression(head, tail) {
   return buildTree(head, tail, function(result, element) {
     return {
       type:     "BinaryExpression",
       operator: element[1],
       left:     result,
       right:    element[3]
     };
   });
  }
}


start
  = emptyLine* transaction:transaction* { return transaction; }

transaction
  = lineComment*
    newline? date:date space status:status payee:payee note:transactionNote?
    posting:posting+
    emptyLine*
    {
      return {
        date: date,
        status: status,
        payee: payee,
        posting: posting,
        note: note
      };
    }

date
  = year:year "/" month:month "/" day:day { return {year:year, month:month, day: day}; }

year
    = digits:[0-9]+ {
      var year = parseInt(digits.join(""), 10);
      if(!(1000 < year && year < 10000)){
        error("Incorrect year: " + year);
      }
      return year;
    }

month
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

day
  = digits:[0-9]+ { return parseInt(digits.join(""), 10);}

status
  =  "*" space { return "*"; } /
     "!" space { return "!"; } /
     "" {return ""}

payee
  = (!hardSeparator !newline .)* { return text();}

transactionNote
  = hardSeparator+ comment:comment { return comment; }

posting
  = postingPrefix account:account amount:amount note:postingNote? {return {account:account, currency:amount.currency, amount:amount.amount, note: note}} /
    postingPrefix account:account note:postingNote? {return {account:account, currency:undefined, amount:undefined, note: note}} /
    postingPrefix comment:comment { return {isComment: true, text: comment }; }

postingPrefix
  = newline space

lineComment
  = newline? comment:comment { return comment; }

postingNote
  = space+ comment:comment { return comment; }

comment
  = ";" comment:upToNewline  { return comment; }


amount
  = currency:"$" amount:Number {return {currency:currency, amount:amount};} /
    expression:valueExpression {return {amount:expression};}


account
  = accountWithSeparator+

accountWithSeparator
  = a:accountLevel accountLevelSep { return a } /
  a:accountLevel accountAmountSep { return a }

accountAmountSep
  = "  "

accountLevelSep
  = ":"

accountLevel
  = start:word space:space end:word {return start.join("") + space.join("") + end.join(""); } / word:word  { return word.join("")}


/*
-------------------
Simple expressions
-------------------
*/

word
 = [a-zA-Z0-9]+

upToNewline
  = (!newline .)+ { return text(); }


/*
----------
Separators
----------
*/

emptyLine
  = space* newline

hardSeparator
  = "\t"+ / " " " "+ / " " "\t"+

space
  = [ \t]+

newline
  = "\n" / "\r\n"


/*
-----------------
Value Expression
-----------------
*/
valueExpression
  = Identifier
  / AmountLiteral
  / Number
  / "(" __ expression:AdditiveExpression __ ")" { return expression; }


Identifier
  = [a-zA-Z]+

AmountLiteral
  = Currency Number

Currency
 = "$"

__
  = space*


UnaryExpression
  = valueExpression
  / operator:UnaryOperator __ argument:UnaryExpression {
      return {
        type:     "UnaryExpression",
        operator: operator,
        argument: argument,
        prefix:   true
      };
    }

UnaryOperator
  =
   $("+" !"=")
  / $("-" !"=")

MultiplicativeExpression
  = head:UnaryExpression
    tail:(__ MultiplicativeOperator __ UnaryExpression)*
    { return buildBinaryExpression(head, tail); }

MultiplicativeOperator
  = $("*" !"=")
  / $("/" !"=")
  / $("%" !"=")

AdditiveExpression
  = head:MultiplicativeExpression
    tail:(__ AdditiveOperator __ MultiplicativeExpression)*
    { return buildBinaryExpression(head, tail); }

AdditiveOperator
  = $("+" ![+=])
  / $("-" ![-=])


Number
  = minus? int frac? exp? { return parseFloat(text()); }

  decimal_point = "."
  digit1_9      = [1-9]
  e             = [eE]
  exp           = e (minus / plus)? DIGIT+
  frac          = decimal_point DIGIT+
  int           = zero / (digit1_9 DIGIT*)
  minus         = "-"
  plus          = "+"
  zero          = "0"
  DIGIT  = [0-9]