/*
https://pegjs.org/documentation
https://github.com/pegjs/pegjs
http://ledger-cli.org/3.0/doc/ledger3.html#Journal-File-Format-for-Developers
https://github.com/MikeMcl/big.js/
*/
start
  = y:year "/" m:month "/" d:day space s:status p:payee
    {
      var theStatus = "";
      if(s != undefined && s != null && s != ""){
         theStatus = s.join("").trim();
      }
      return {
        year:y,
        month:m,
        day:d,
        status:theStatus,
        payee:p.join("")
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
  = .+

space
  = " "+
