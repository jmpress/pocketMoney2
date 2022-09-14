# pocketMoney2.0
## An implementation of Envelope Budgeting principles.

This is an exercise in writing a RESTful Express API that handles database operations for a PostgreSQL server via  HTTP requests from a simple HTML/CSS/JS front-end. 

## Description
See the `openapi.yaml` file in this repository for details on API routes, HTTP response status, and example data.

## Specs
+ Create Envelope object and a Transaction object definitions
   + Create a PostgreSQL database with tables to hold data that persists between sessions.
+ Create methods to check the validity of data used to create new Envelopes and Transactions
+ Create methods to retrieve all Envelopes and Transactions from database and display them to the page.
+ Create a method to create a new Envelope from user input.
+ Create a method that creates a new Transaction. This method adds value to a specified Envelope (negative numbers subtract). 
   + Should not reduce below 0.
+ Create a method to edit the name or maximum budget of an Envelope.
+ Create a method to edit attributes of a Transaction. Any change to the value of the Transaction must be reflected in the appropriate Envelope. If the target Envelope is changed, this method must remove its value from the initial Envelope and add it to the new target Envelope.
+ Create a method to delete an Envelope. This method should also delete all Transactions associated with that Envelope.
+ Create a method to delete a Transaction. This method must also reverse the value change to the appropriate Envelope.
+ Create a method to add money to Envelopes when income is applied. Value should be split between Envelopes proportionate to their budget size. New Transactions are created to ensure that the data can be removed or reversed properly in the future if necessary.
+ Sanitize user input to avoid XSS injection attacks.

## Setup/Installation Requirements
+ This app is hosted at <https://pocketmoney2.herokuapp.com/>.

OR

+ Fork this repository
+ Install Node and PostgreSQL locally.
+ Navigate to folder and run `npm install`
+ Create a .env file in the root directory with your database authentication information. Use the following format:
    ```
    PMAPIUSER = "apiuser"
    PMHOST = "localhost"
    PMDATABASE = "pocket_money_2"
    PMAPIUSERPW = "p4ssw0rd"
    PMDBPORT = "5432"
    ```
+ use the `initialCreate.sql` file to create the appropriate tables locally.
+ run `npm start`
+ navigate to <http://localhost:3000> to begin using the program.

## Known Bugs
+ Not a bug per-se, but the user interface is not terribly intuitive (one might even say "rough" and I would not disagree).

## Support and contact details
Please contact j.michael.press@gmail.com with questions, comments, or concerns. You are also welcome to submit a pull request.

## Technologies Used
+ Javascript
+ Node.js
+ Express
+ PostgreSQL

### License
This software is released under the GNU general public license.

Copyright (c) 2022 Jeffrey Press
