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
    const queryText = 'SELECT * FROM envelopes;'
    envelopes.length=0;
    const {rows} = await db.query(queryText);
    for(let i = 0; i < rows.length; i++){
        envelopes.push(rows[i]);
    }
    res.status(200).send(envelopes);
});

//Works
envRouter.post('/', isValidEnvelope, async (req, res, next) => {
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else{    
        const newE = req.body;
        const newID = newE.envelope_id;
        const newName = newE.envelope_name;
        const newValue = newE.current_value;
        const newBudget = newE.budgeted_value;
        const newIncomeCheck = newE.isincome;
        const queryText = 'INSERT INTO envelopes VALUES ($1, $2, $3, $4, $5);'
        const result = await db.query(queryText, [newID, newName, newValue, newBudget, newIncomeCheck]);
        envelopes.push(newE);
        res.status(201).send(envelopes);
    }
});

//Needs some front-end work before I can test it.
//Nothing here integrates with PSQL yet.
envRouter.delete('/:id', async (req, res, next) => {
    const target = req.params.id;

    //validate that target is an envelope that exists
    req.isValid = envelopes.some(envelope => {
        return envelope.envelope_id == target;
    });
    
    if(!req.isValid){
        res.status(404).send(req.validReason);
    } else {
        //if it's a valid envelope that exists, then
        const deleteQuery = 'DELETE FROM envelopes WHERE envelope_id = $1;';
        const {rows} = await db.query(deleteQuery, [target]);

        res.status(200).send();
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