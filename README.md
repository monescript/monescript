[![Build status](https://travis-ci.org/abtechbit/lui.svg?branch=master)](https://travis-ci.org/abtechbit/lui)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# luini

luini (_**L**edger **u**ser **i**nterface **n**o **i**nstall_) is a personal accounting system that works in you browser. luini works with text files formatted as a Ledger journal. 
luini performs all the calculations in the browser and does not require ledger-cli presence in the system. Similar to Ledger, 
no modification is made to the original journal, luini only performs journal analysis, presents financial graphs and suggests 
adjustments or additions. 

luini supports subset of the Ledger v3 journal syntax as detailed below. Depending on the usage, the plan is to
continuously evolve the functionality to come close to covering all Ledger journal features. 


## Supported Ledger syntax in luini
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


