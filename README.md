[![Build status](https://travis-ci.org/monescript/monescript.svg?branch=master)](https://travis-ci.org/monescript)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

# monescript

monescript is a double-entry [plain text accounting](http://plaintextaccounting.org/) system that works in you browser. 
monescript is a server-less application, all the calculations are performed locally in your browser window without any data 
leaving your computer. 

monescript works with text files formatted as a transaction journal. No modification is made to the original journal, monescript 
only performs journal analysis and presents financial summary graphs and statistics.

# Motivation

For years I've been using Excel to handler my personal accounting. After reading an excellent 
[introduction to double-entry accounting](https://docs.google.com/document/d/100tGcA4blh6KSXPRGCZpUlyxaRUwFHEvnz_k9DyZFn4/edit)
from [Beancount](http://furius.ca/beancount/) documentation and discovering plain-text account, I decided to give [Ledger](http://ledger-cli.org) 
a try. I had lots of fun discovering ledger command line reporting features and getting summary in couple simple commands.

Around that time I wanted to learn some JavaScript. Having monescript implemented in JavaScript gives it flexibility to work on pretty much any system
where you have a browser and text editor, and you do not need to install anything - just add your transactions to the text file and open it in monescript to 
get all the details in couple of clicks. 

## [Demo](https://monescript.github.io/)
By default demo shows randomly generated data on the Transactions tab. 

You can explore the generated journal format on the Source tab.

If you have a file with monescript journal syntax you can feed it to monescript from the Open tab. 

## monescript journal syntax

monescript syntax is inspired by [Ledger](http://ledger-cli.org) journal syntax. Here is the list of
features that are currently supported by monescript parser:

- Transaction format
  - YYYY/MM/DD date format
  - $ currency
  - simple arithmetic value expressions (+, -, *, /)
  - notes prefixed with ';'
- line comments prefixed with ';' or '#'
- bucket command
- tag names
- include and year commands (ignored)

There is no restriction on the name of the accounts. 

Journal is expected to be balanced, which means that for every transaction has to have source and destination account(s). 
if journal is not balanced. monescript will not be able to analyze the journal and show an error.

### Sample monescript journal file


```` 
bucket Assets:Bank:Checking 

2017/1/9 * The Doughnut
  Expenses:Food:Takeout                  $10.10
  Assets:Bank:Checking 

2017/1/7 * Pharmacy One
  Expenses:Pharmacy                      $22.34
# don't have to specify the source account, when defined with bucket command above  

2017/2/1 * PartyShack
  ; monescript can compute simple expressions, like this tax calculation 
  Expenses:Entertainment                 ($5.89 * 1.05) 
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
