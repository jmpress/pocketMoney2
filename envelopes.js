const express = require('express');
const db = require('./db')
const Router = require('express-promise-router');
const envRouter = new Router();

const envelopes = [];

/* Envelope object definition:
{
    envelope_id: integer,  - the id number used to refer to the envelope
    envelope_name: string,  - the name used to label the envelope
    current_value: number,  - represents how much money is actually in this envelope
    budgeted_value: number,  - represents the total dollar amount budgeted for this envelope
    isincome: boolean       - Is this income? If not, it's an expense
}

*/

//Checks the validity of an envelope
//Works for proper values - needs testing for incorrect/missing values
function isValidEnvelope(req, res, next){
    req.envelopeID = req.body.envelope_id;
    req.envelopeName = req.body.envelope_name;
    req.envelopeCurrentValue = req.body.current_value;
    req.envelopeBudgetedValue = req.body.budgeted_value
    req.isIncome = req.body.isincome;
    //What's the actual logic to validate an envelope object
    //Assume true:
        req.isValid = true;
    //Make sure budget > 0
        if(req.envelopeBudgetedValue<=0){
            req.isValid = false;
            req.validReason = 'Budgeted amount must be a positive number.'
        }

    //make sure isincome has a value
        if(req.isIncome === undefined){req.isValid = false;req.validReason='Highly Unlikely'}

    //Make sure the ID isn't already taken
    //Make sure the name isn't aleady taken
        for(let i = 0; i < envelopes.length; i++){
            if(envelopes[i].envelope_id === req.envelopeID || envelopes[i].envelope_name === req.envelopeName){
                req.isValid = false;
                req.validReason = 'ID or name already taken.'
            }
        }
    //All done. If there's no reason for it to be false, isValid will still be true from instantiation.
    next();
}

//Works
//Needs error handling
envRouter.get('/', async (req, res, next) => {
    queryText = 'SELECT * FROM envelopes;'
    const {rows} = await db.query(queryText);
    for(let i = 0; i < rows.length-1; i++){
        envelopes.push(rows[i]);
    }
    res.status(200).send(envelopes);
});

//Works
envRouter.post('/', isValidEnvelope, (req, res, next) => {
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else{    
        envelopes.push(req.body);
        res.status(201).send(envelopes);
    }
});

envRouter.delete('/:id', (req, res, next) => {
    req.isValid = false;
    req.validReason = 'Invalid Envelope ID';
    for(let i = 0; i < envelopes.length; i++){
        if(envelopes[i].envelope_id === req.envelopeID){
            req.isValid = true;
            req.validReason = null;
            req.targetIndex = i;
            break;
        }
    }
    if(!req.isValid){
        res.status(404).send(req.validReason);
    } else {
        //otherwise, remove it from the array (splice)        
        envelopes.splice(req.targetIndex, 1);
        res.status(200).send(envelopes);
    }

});

envRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = envRouter;


/*
//ADMIN MODE - redo this whole thing

envRouter.put('/', isValidEnvelope, (req, res, next) => {
    if(req.index === -1){
        res.status(404).send();
    } else {
        envelopes[req.index].current_value += Number(req.targetBudget);
        if(envelopes[req.index].current_value > envelopes[req.index].budgeted_value){
            envelopes[req.index].current_value = envelopes[req.index].budgeted_value;
        }
        if(envelopes[req.index].current_value < 0){
            envelopes[req.index].current_value = 0;
        }
        
        res.status(200).send(envelopes);
    }
});
*/