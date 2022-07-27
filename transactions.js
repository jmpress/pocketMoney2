const express = require('express');
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
    /*Redo this logic
    req.targetLabel = req.query.name;
    req.targetBudget = req.query.value;
    let targetIndex = -1;
    for(let i = 0; i < transactions.length; i++){
        if(transactions[i].name === req.targetLabel){
            targetIndex = i;
        }
    }
    req.index = targetIndex;
    */

    next();
}


txnRouter.get('/', (req, res, next) => {
    res.status(200).send(transactions);
});

txnRouter.post('/', isValidTransaction, (req, res, next) => {
    if(req.index !== -1 || req.targetBudget < 0){
        res.status(400).send();
    } else if(req.targetLabel && req.targetBudget){
        const newTransaction = {
            /* what variables are carrying this info? req.?
            transaction_id: ,
            wd_envelope_id: ,
            transaction_date: ,
            payment_recipient: ,
            payment_amount: 1000
            */
        }
        transactions.push(newTransaction);
        res.status(201).send(transactions);
    } else {
        res.status().send();
    }
});

txnRouter.put('/', isValidTransaction, (req, res, next) => {
    if(req.index === -1){
        res.status(404).send();
    } else {
        transactions[req.index].current_value += Number(req.targetBudget);
        if(transactions[req.index].current_value > transactions[req.index].budgeted_value){
            transactions[req.index].current_value = transactions[req.index].budgeted_value;
        }
        if(transactions[req.index].current_value < 0){
            transactions[req.index].current_value = 0;
        }
        
        res.status(200).send(transactions);
    }
});

txnRouter.delete('/', isValidTransaction, (req, res, next) => {
    if(req.index === -1){
        res.status(404).send();
    } else {
        //otherwise, remove it from the array (splice)
        transactions.splice(req.index, 1);
        res.status(200).send(transactions);    
    }
});

txnRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = txnRouter;