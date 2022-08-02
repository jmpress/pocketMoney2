const express = require('express');
const db = require('./db');
const Router = require('express-promise-router');
const txnRouter = new Router();

//Internal Data Structure for holding Transaction objects.
const transactions = [];

/* Transaction object definition:
{
    transaction_id: 0,
    wd_envelope_id: 1,   //imagine a corresponding envelope object with envelope_id: 1 named "Rent"
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

    /*Does this actually need to be true? Harder to pass in addition transactions with this in play.
    Make sure transaction amount > 0
    if(req.amount<=0){
        req.isValid = false;
        req.validReason = 'Amount must be a positive number.'
    }*/

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

//Working
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
        
        // A new transaction should also change the current_value of the envelope with id wd_envelope_id
        const updateQuery = 'UPDATE envelopes SET current_value = current_value - $1 WHERE envelope_id = $2';        
        await db.query(updateQuery, [newAmount, newTarget]);
        
        transactions.push(newT);
        res.status(200).send(transactions);
    }
});

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
        const updateQuery = 'UPDATE envelopes SET current_value = current_value + $1 WHERE envelope_id = $2';
        await db.query(updateQuery, [changeAmount, affEnv]);
            
        res.status(200).send();
    }
});

//PUT route to update values of a transaction
//isValidTransaction middleware causes issues here, because here I need to use the case where ID numbers do match.
txnRouter.put('/:id', async (req, res, next) => {
    req.isValid = true; //kludge until I come up with another validation method.
    if(!req.isValid){
        console.log(req.validReason);
        res.status(400).send(req.validReason);
    } else {    
        const newT = req.body;
        
        const newID = newT.transaction_id;
        const newTarget = newT.wd_envelope_id;
        const newDate = newT.transaction_date;
        const newPayee = newT.payment_recipient;
        const newAmount = newT.payment_amount;

        const checkOld = 'SELECT * FROM transactions WHERE transaction_id = $1';
        const { rows } = await db.query(checkOld, [newID]);
        const oldT = rows[0]; //This object is the original version of the transaction in question from the database, for later use.
        

        //Query to update the transaction in question
        const queryText = 'UPDATE transactions SET wd_envelope_id = $2, transaction_date = $3, payment_recipient = $4, payment_amount = $5 WHERE transaction_id = $1;'
        await db.query(queryText, [newID, newTarget, newDate, newPayee, newAmount]);

        //Handling balance changes between envelopes
        if(oldT.wd_envelope_id != newTarget){
        //different envelopes, two balance changes. 
        //This naturally handles cases where the amount of the transaction is also being updated as well.
            //First change old envelope back
            const updateOldQuery = 'UPDATE envelopes SET current_value = current_value + $1 WHERE envelope_id = $2';
            await db.query(updateOldQuery, [oldT.payment_amount, oldT.wd_envelope_id]);
            //Second change new envelope to compensate
            const updateNewQuery = 'UPDATE envelopes SET current_value = current_value - $1 WHERE envelope_id = $2';
            await db.query(updateNewQuery, [newAmount, newTarget]);

        } else if(oldT.payment_amount != newAmount){
        //Case when envelope is the same, but amount changes.
            //calculate difference
            const diff = (oldT.payment_amount - newAmount);
            //Query database and current_value = current_value - diff; or something to that effect
            const amtQuery = 'UPDATE envelopes SET current_value = current_value + $1 WHERE envelope_id = $2';
            await db.query(amtQuery, [diff, newTarget]);
        }

        res.status(200).send();
    }
});

txnRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = txnRouter;
