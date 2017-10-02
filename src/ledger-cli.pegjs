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


journal
  = entries:entry* { return entries.filter(function(e){ return !e.empty}); }

entry
  = t:transaction { return t } /
    c:command {return c; } /
    c:lineComment {return {empty: true}; } /
    emptyLine {return {empty: true}}

command
  = "bucket" space account:account { return {type: "bucket", account:account}}
    / "include" upToNewline
    / "year" upToNewline

transaction
  = date:date space status:status payee:payee note:transactionNote?
    posting:posting+
    {
      return {
        type: 'transaction',
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
  = postingPrefix
   !mainCommentPrefix account:account
   amount:postingAmount?
   note:postingNote? space?
  {
    var currency = amount == null ? undefined : amount.currency;
    var value = amount == null ? undefined : amount.amount;
    var assignment = amount == null ? undefined : amount.assignment;
    return {
      account:account,
      currency:currency,
      amount:value,
      assignment: assignment,
      note: note
    }
  }
  / postingPrefix comment:comment { return {isComment: true, text: comment }; }

postingPrefix
  = newline space

lineComment
  = comment:comment { return comment; } /
    "#" upToNewline

postingAmount
  = accountAmountSep s:postingAssignment a:amount {
    var amount = a;
    amount.assignment = s;
    return amount;
  }

postingAssignment
  = s:assignment? space* {return s != undefined}

assignment
  = "="

postingNote
  = space* comment:comment { return comment; }

comment
  = mainCommentPrefix comment:upToNewline  { return comment; }

mainCommentPrefix
  = ";"

amount
  = currency:"$" amount:Number {return {currency:currency, amount:amount};} /
    expression:valueExpression {return {amount:expression};}

account
  = accountLevelWithSeparator+

accountLevelWithSeparator
  = a:accountLevel accountLevelSep { return a } /
    a:accountLevel { return a }

accountAmountSep
  = [ \t] [ \t]+

accountLevelSep
  = ":"

accountLevel
  = (!hardSeparator !newline !accountLevelSep .)+ { return text(); }

/*
-------------------
Simple expressions
-------------------
*/

word
 = [a-zA-Z0-9]+

upToNewline
  = (!newline .)* { return text(); }


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
  = minus? int frac? exp? { return parseFloat(text().replace(/,/g, '')); }

  decimal_point = "."
  digit1_9      = [1-9]
  e             = [eE]
  exp           = e (minus / plus)? DIGIT+
  frac          = decimal_point DIGIT+
  int           = zero / (digit1_9 DIGIT*)
  minus         = "-"
  plus          = "+"
  zero          = "0"
  DIGIT  = [0-9,]