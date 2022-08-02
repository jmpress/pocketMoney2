# pocketMoney2.0
## An upgraded implementation of Envelope Budgeting principles.

This is an exercise in writing an Express API that handles database operations for a PostgreSQL server via  HTTP requests from a simple HTML/CSS/JS front-end. 

### Installation and Set-up
Please Note: Instructions for installing Node, Node modules, Express, or PostreSQL are beyond the scope of this document.

The server uses some pre-defined middleware components for request parsing (body-parser), logging (morgan), and some other functionality which will need to be installed locally if they are not already present on your system.

Prior to running this locally, you will need to create a .env file in the root directory with your database authentication information. Use the following format, but with your own credentials and database name:
```
PMAPIUSER = "apiuser"
PMHOST = "localhost"
PMDATABASE = "pocket_money_2"
PMAPIUSERPW = "p4ssw0rd"
PMDBPORT = "5432"
```
Once the .env file is created, run  `$node server.js`, and navigate to localhost:3000 to begin using the program.

### Description

The envelopes and transactions that are displayed are taken directly from the current state of the database. Changes made to this data while using the program will persist from one session to the next.

The top section is for displaying feedback error messages for the user, such as if a user tries to make a new envelope with an ID that has already been used.

Income is modeled with the "Get Paid" button and its accomanying input box. The amount entered into the box is split proportionately into each envelope, based on it's % of the total budget. Each split is recorded into a separate transaction and logged below in the transactions section.

The next section displays the envelopes themselves. Each envelope has a unique ID and a unique Name as well as a balance (current_value), a budget (budgeted_value), and a checkbox to be used with the Delete button (see below). The input fields and buttons immediately below the envelope section have the following functionality:
+ Delete Checked Envelopes: Deletes all envelopes with the "delete" column checkbox marked. **This will also delete transactions that apply to those envelopes.**
+ Make a new Envelope: uses the values of the input fields to create a new envelope.
+ Update Envelope: used to update a non-balance field of an envelope that already exists. Use the input fields to put the correct information in, and click the Update Envelope button to save it.

The envelope UI is mirrored below for transactions. The input fields and buttons on the bottom half of the screen apply to transaction operations.
+ Record a new transaction: uses the values of the input fields to create a new transaction.
+ Update transaction: used to update details of an already recorded transaction in case an error was made.
+ Delete Checked Transactions: Deletes all transactions with the "delete" column checkbox marked. This will revert the balances in the affected envelopes to the values they were at before the transaction was logged.

<hr>

### Intended user flow:

#### Initial Set-up:
+ Using the input fields and the "Make a new Envelope" button, create several envelopes that represent your expenses. The total budgets should not be more than your monthly income. This planning is the actual hard part, so take your time and refer to old bank statements if need be.

#### When you get paid:
+ When you get paid, enter your paycheck amount into the top field and click "Get Paid" to create a series of transactions that adds money to each of your envelopes. The amount of money added to each envelope is proportional to the budget of that envelope compared to the total budget.
+ Note that it is possible that you might end up with more money than what you've budgeted for an envelope if your spending in that category was lower than expected the prior month. In cases such as this, you may want to consider using the Update Envelope button to lower your budget in that category so less money is distributed to it from each paycheck.

#### When you spend money:
+ When you spend money, log a new transaction with the appropriate information. The transaction ID must be a unique number. The From Env field should be the ID of the expense envelope category you're spending from.
+ If you run out of money in an envelope, you're not allowed to spend any more in that category until you're paid again. 

#### If you have made a mistake:
+ If you notice that you made a mistake with some of the details of an envelope or a transaction, you can re-enter the correct information (with the same ID number) and click the appropriate "Update" button to make the change. 
