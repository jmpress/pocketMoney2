const express = require('express');
const db = require('./db/db')
const txnRouter = express.Router();

const transactions = [
    {
        transaction_id: 0,
        wd_envelope_id: 1,
        transaction_date: '2020-09-01',
        payment_recipient: 'Landlord',
        payment_amount: 1000
    },
    {
        transaction_id: 1,
        wd_envelope_id: 2,
        transaction_date: '2020-09-02',
        payment_recipient: 'Fred',
        payment_amount: 100
    },
    {
        transaction_id: 2,
        wd_envelope_id: 3,
        transaction_date: '2020-09-02',
        payment_recipient: 'PGE',
        payment_amount: 60
    },
    
];
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


txnRouter.get('/', (req, res, next) => {
    res.status(200).send(transactions);
});

txnRouter.post('/', isValidTransaction, (req, res, next) => {
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else {
        transactions.push(req.body);
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

txnRouter.delete('/', isValidTransaction, (req, res, next) => {
    if(!req.isValid){
        res.status(404).send(req.validReason);
    } else {
        //otherwise, remove it from the array (splice)
        let deletionTargetIndex = -1;
        for(let i = 0; i < transactions.length; i++){
            if(transactions[i].transaction_id === req.transactionID){
                deletionTargetIndex = i;
                break;
            }
        }        

        transactions.splice(deletionTargetIndex, 1);
        res.status(200).send(transactions);    
    }
});

txnRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = txnRouter;