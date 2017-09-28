start
  = comment*
    y:year "/" m:month "/" d:day space s:status p:payee
    posting:posting+
    {
      var theStatus = "";
      if(s != undefined && s != null && s != ""){
         theStatus = s.join("").trim();
      }

      return {
        year: y,
        month: m,
        day: d,
        status: theStatus,
        payee: p.join(""),
        posting: posting
      };
    }

comment
  = ";" [^\r\n]* newline

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
  =  "*" space / "!" space / "" {return text(); }

payee
  = [^\r\n]+

posting
  = postingPrefix account:account amount:amount {return {account:account, currency:amount.currency, amount:amount.amount}}

postingPrefix
  = newline space

amount
  = currency:"$" amount:number {return {currency:currency, amount:amount};}


number "number"
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

word
 = [a-zA-Z0-9]+

space
  = " "+

newline
  = "\n" / "\r\n"
