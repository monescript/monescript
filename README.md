[![Build status](https://travis-ci.org/abtechbit/luini.svg?branch=master)](https://travis-ci.org/abtechbit/luini)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# luini

luini is a double-entry [plain text accounting](http://plaintextaccounting.org/) system that works in you browser. 
There is no server behind luini, all the calculations are performed locally in your browser window without any data 
leaving your computer. 

luini works with text files formatted as a journal and performs all the calculations in the browser. No modification 
is made to the original journal, luini only performs journal analysis and presents financial summary graphs and statistics.

## [Demo](https://abtechbit.github.io/)
By default demo shows randomly generated data on the Transactions tab. 

You can explore the generated journal on the Source tab.

If you have a file with luini journal syntax you can feed to luini from the Open tab. 

## luini journal syntax

luini syntax is loosely based on a simplified [Ledger](http://ledger-cli.org) journal syntax. Here is the list of
features that are currently supported by luini parser:

- Transaction format
  - YYYY/MM/DD date format
  - $ currency
  - simple arithmetic value expressions (+, -, *, /)
  - notes prefixed with ';'
- line comments prefixed with ';' or '#'
- bucket command
- include and year commands (ignored)

There is no restriction on the name of the accounts. 

Journal is expected to be balanced, which means that for every transaction has to have source and destination account(s). 
if journal is not balanced. luini will not be able to analyze the journal and show an error.

### Sample luini journal file


```` 
bucket Assets:Bank:Checking 

2017/1/9 * The Doughnut
  Expenses:Food:Takeout                  $10.10
  Assets:Bank:Checking 

2017/1/7 * Pharmacy One
  Expenses:Pharmacy                      $22.34
# don't have to specify the source account, when defined with bucket command above  

2017/2/1 * PartyShack
  Expenses:Entertainment                 ($5.89 * 1.05) ; luini can compute simple expressions, like thistax calculation 
  Expenses:Clothing                      $16.72
  Assets:Bank:Checking 

; You can insert arbitrary comments between transactions
2017/1/13 * Groceries and More
  Expenses:Food:Grocery                  $29.32 ; Or for each posting
  Assets:Bank:Checking 

2017/2/3 * Laser Play
  Expenses:Entertainment                 $45.96

2017/2/4 * Eastern Gas
  Expenses:Bills:Gas                     $47.64
  Assets:Bank:Checking                   $-47.64 

````

