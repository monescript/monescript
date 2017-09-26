start
  = y:year "/" m:month "/" d:day space s:status p:payee newline
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
  = space account:account {return {account:account}}

account
  = accountWithSeparator+

accountWithSeparator
  = accountLevel:accountLevel accountLevelSep {return accountLevel.join("")}

accountAmountSep
  = "  "

accountLevelSep
  = ":"

accountLevel
  = [a-zA-Z0-9 ]+

space
  = " "+

newline
  = "\n" / "\r\n"
