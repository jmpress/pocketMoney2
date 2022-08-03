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
async function isValidTransaction(req, res, next){
        let {transaction_id, wd_envelope_id, transaction_date, payment_recipient, payment_amount} = req.body;

    //What's the actual logic to validate a transaction object

    //Assume true:
        req.isValid = true;
        req.IDMatch = false;

    //Validate transaction_id as a number > 0
        transaction_id = parseInt(transaction_id, 10);
        if(isNaN(transaction_id) || transaction_id < 0){
            req.isValid = false;
            req.validReason = 'ID must be 0 or a positive number.'
            next();
        }

    //Check and flag if the transaction ID already exists or not.
        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].transaction_id === transaction_id){
                req.IDMatch = true;
            }
        }

    //Validate wd_envelope_id as a number >0
        wd_envelope_id = parseInt(wd_envelope_id, 10);
        if(isNaN(wd_envelope_id) || wd_envelope_id < 0){
            req.isValid = false;
            req.validReason = 'Target Envelope ID must be 0 or a positive number.'
            next();
        }

    //Check if the wd_envelope_id exists in database already
        validEnvQuery = 'SELECT * FROM envelopes WHERE envelope_id = $1';
        const {rows} = await db.query(validEnvQuery, [wd_envelope_id])
        if(!rows[0]){
            req.isValid = false;
            req.validReason = 'No envelope with that ID exists.'
            next();
        }

    //make sure Payee has a clean string value
        if(payment_recipient === undefined || payment_recipient === null || (typeof payment_recipient != 'string')){
            payment_recipient = 'Unknown';
        } else {

    //Sanitize Payee string and truncate if necessary
            payment_recipient = payment_recipient.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
            payment_recipient = payment_recipient.trim();
            if(payment_recipient.length>14){
                payment_recipient = payment_recipient.slice(0, 14);
            }
        }

    //validate Date format
    const validatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;
    const dateVal = transaction_date.match(validatePattern);
    if(!dateVal){
        req.isValid = false;
        req.validReason = 'Invalid date format';
        next();
    }

        const fixedNewTransaction = {
            transaction_id,
            wd_envelope_id,
            transaction_date,
            payment_recipient,
            payment_amount
        }
        req.body = fixedNewTransaction;
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
    if(req.IDMatch){
        req.isValid = false; 
        req.validReason = 'Must use a unique ID for new transactions.'
    }
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else {
        const newT = req.body;
        
        const queryText = 'INSERT INTO transactions VALUES ($1, $2, $3, $4, $5);'
        await db.query(queryText, [newT.transaction_id, newT.wd_envelope_id, newT.transaction_date, newT.payment_recipient, newT.payment_amount]);
        
        // A new transaction should also change the current_value of the envelope with id wd_envelope_id
        const updateQuery = 'UPDATE envelopes SET current_value = current_value - $1 WHERE envelope_id = $2';        
        await db.query(updateQuery, [newT.payment_amount, newT.wd_envelope_id]);
        
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
txnRouter.put('/:id', isValidTransaction, async (req, res, next) => {
    if(!req.IDMatch){ //valid transaction but ID doesn't match
        req.isValid = false; 
        req.validReason = 'ID does not exist yet. Make a new transaction with this ID before Updating it.'
    }
    if(!req.isValid){
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
