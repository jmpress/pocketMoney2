const express = require('express');
const db = require('./db');
const Router = require('express-promise-router');
const txnRouter = new Router();

const transactions = [];

/* Transaction object definition:
{
    transaction_id: 0,
    wd_envelope_id: 1,
    transaction_date: '2020-09-01',
    payment_recipient: 'Landlord',
    payment_amount: 1000
}
*/

//Checks the validity of a transaction
function isValidTransaction(req, res, next){
    
    req.transactionID = req.body.transaction_id;
    req.wdEnvelopeID = req.body.wd_envelope_id;
    req.date = req.body.transaction_date;
    req.payee = req.body.payment_recipient;
    req.amount = req.body.payment_amount;
    
    //What's the actual logic to validate a transaction object

    //Assume true:
    req.isValid = true;

    //Make sure transaction amount > 0
    if(req.amount<=0){
        req.isValid = false;
        req.validReason = 'Amount must be a positive number.'
    }

    //make sure Payee has a value
    if(req.payee === undefined || req.payee === null){req.isValid = false;req.validReason='Payee required.'}

    //Make sure the ID isn't already taken
    for(let i = 0; i < transactions.length; i++){
        if(transactions[i].transaction_id === req.transactionID){
            req.isValid = false;
            req.validReason='Transaction ID must be Unique'
        }
    }

    //validate Date format

    //Make sure the envelope ID exists
    //I'm already in the back-end...just include the envelopes table in the SQL query.
    //for now, assume it's a valid envelope ID.


    //Make sure the current_value of that envelope is greater than or equal to req.amount
    //This validation might belong in the function that actually does the math to subtract the two as well.
    //Actually maybe that should all go here...?
    

    next();
}


txnRouter.get('/', async (req, res, next) => {
    const queryText = 'SELECT * FROM transactions;'
    transactions.length = 0; //avoid checking for duplicates, just read them all again.
    //Which is more expensive? The database query or the duplication check?
    const {rows} = await db.query(queryText);
    for(let i = 0; i < rows.length; i++){
            transactions.push(rows[i]);
    }
    res.status(200).send(transactions);
});

txnRouter.post('/', isValidTransaction, async (req, res, next) => {
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else {
        const newT = req.body;
        const newID = newT.transaction_id;
        const newTarget = newT.wd_envelope_id;
        const newDate = newT.transaction_date;
        const newPayee = newT.payment_recipient;
        const newAmount = newT.payment_amount;
        
        const queryText = 'INSERT INTO transactions VALUES ($1, $2, $3, $4, $5);'
        await db.query(queryText, [newID, newTarget, newDate, newPayee, newAmount]);
        
        const incomeCheck = 'SELECT isincome FROM envelopes WHERE envelope_id = $1';
        const {rows} = await db.query(incomeCheck, [newTarget]);
        const targetIsIncome = rows[0].isincome;
        // A new transaction should also change the current_value of the envelope with id wd_envelope_id
        let updateQuery;
                if(targetIsIncome){
                    updateQuery = 'UPDATE envelopes SET current_value = current_value + $1 WHERE envelope_id = $2';
                } else {
                    updateQuery = 'UPDATE envelopes SET current_value = current_value - $1 WHERE envelope_id = $2';
                }
        await db.query(updateQuery, [newAmount, newTarget]);
        
        transactions.push(newT);
        res.status(201).send(transactions);
    }
});

/* Do we even want PUT as an option? I don't want end user to be able to edit transactions directly. Admin should be able to. A future extension could introduce ADMIN MODE that allows more edits, but will also require more validation logic.

txnRouter.put('/', isValidTransaction, (req, res, next) => {
    if(!req.isValid){
        res.status(404).send(req.validReason);
    } else {
        
        res.status(200).send(transactions);
    }
});
*/
//Works as expected
txnRouter.delete('/:id', async (req, res, next) => {
    const target = req.params.id;
    let affEnv; 
    let changeAmount;

    //validate that target is a transaction that exists
    req.isValid = transactions.some(transaction => {
        if(transaction.transaction_id == target){
            affEnv = transaction.wd_envelope_id;
            changeAmount = transaction.payment_amount;
            return true;
        } else {return false;}
    });
    
    if(!req.isValid){
        res.status(404).send(req.validReason);
    } else {
        //if it's a valid transaction that exists, then
        //Deletion Query
        const deleteQuery = 'DELETE FROM transactions WHERE transaction_id = $1;';
        await db.query(deleteQuery, [target]);

        //Now change the balance of the envelope back
        const incomeCheck = 'SELECT isincome FROM envelopes WHERE envelope_id = $1';
        const {rows} = await db.query(incomeCheck, [affEnv]);
        const targetIsIncome = rows[0].isincome;
        // A new transaction should also change the current_value of the envelope with id wd_envelope_id
        let updateQuery;
                if(targetIsIncome){
                    updateQuery = 'UPDATE envelopes SET current_value = current_value - $1 WHERE envelope_id = $2';
                } else {
                    updateQuery = 'UPDATE envelopes SET current_value = current_value + $1 WHERE envelope_id = $2';
                }
        await db.query(updateQuery, [changeAmount, affEnv]);

        res.status(200).send();
    }
});

txnRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = txnRouter;