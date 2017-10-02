[![Build status](https://travis-ci.org/abtechbit/lui.svg?branch=master)](https://travis-ci.org/abtechbit/lui)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# lui

lui is a web-based personal accounting system. lui works with text files formatted as a Ledger journal. 
lui performs all the calculations in the browser and does not require ledger-cli presence in the system. Similar to Ledger, 
no modification is made to the original journal, lui only performs journal analysis, presents financial graphs and suggests 
adjustments or additions. 

lui supports only subset of the Ledger v3 journal syntax as detailed below. Depending on the usage, the plan is to
continuously evolve the functionality to come close to covering all Ledger journal features. 


## Supported Ledger syntax
- basic transaction format
  - YYYY/MM/DD date format
  - $ currency
  - simple arithmetic value expressions
  - notes
- comments
- bucket command
- include and year commands (ignored)



## References
- [Ledger journal syntax](http://ledger-cli.org/3.0/doc/ledger3.html)


