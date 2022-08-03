const express = require('express');
const db = require('./db')
const Router = require('express-promise-router');
const envRouter = new Router();

//Internal Data Structure for holding Envelope objects.
const envelopes = [];

/* Envelope object definition:
{
    envelope_id: integer,  - the id number used to refer to the envelope
    envelope_name: string,  - the name used to label the envelope
    current_value: number,  - represents how much money is actually in this envelope
    budgeted_value: number,  - represents the total dollar amount budgeted for this envelope
}

*/

//Checks the validity of an envelope
//Works for proper values - needs testing for incorrect/missing values
function isValidEnvelope(req, res, next){
        let {envelope_id, envelope_name, current_value, budgeted_value} = req.body;
    
    //What's the actual logic to validate an envelope object
    //Assume true:
        req.isValid = true;

    //Validate envelope_id as a number > 0
        envelope_id = parseInt(envelope_id, 10);
        if(isNaN(envelope_id) || envelope_id < 0){
            req.isValid = false;
            req.validReason = 'ID must be 0 or a positive number.'
            next();
        }

    //Check and flag if the ID already exists or not.
        for(let i = 0; i < envelopes.length; i++){
            if(envelopes[i].envelope_id === envelope_id){
                req.IDMatch = true;
            }
        }

    //current_value is not a user input value, it is always calculated from other input values.

    //Make sure budget > 0
        budgeted_value = parseInt(budgeted_value, 10);
        if(budgeted_value<0 || isNaN(budgeted_value)){
            req.isValid = false;
            req.validReason = 'Budgeted amount must be a positive number.'
            next();
        }

    //validate that Name is a string and exists
        if(envelope_name === undefined || envelope_name === null || (typeof envelope_name != 'string')){
            req.isValid = false;
            req.validReason = 'Invalid envelope name.'
            next();
        }
    
    //Sanitize name string and truncate if necessary
        envelope_name = envelope_name.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
        envelope_name = envelope_name.trim();
        if(envelope_name.length>14){
            envelope_name = envelope_name.slice(0, 14);
        }

    //If it's a new envelope, make sure the name isn't aleady taken
            for(let i = 0; i < envelopes.length; i++){
                if(envelopes[i].envelope_name === envelope_name){
                    if(!req.IDMatch){
                        req.isValid = false;
                        req.validReason = 'Name must be unique.'
                        next();
                    }
                }
            }

        const fixedNewEnvelope = {
            envelope_id,
            envelope_name,
            current_value,
            budgeted_value
        }

        req.body = fixedNewEnvelope;
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
    if(req.IDMatch){
        req.isValid = false; 
        req.validReason = 'Must use a unique ID for new envelopes.'
    }
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else{    
        newE = req.body;
        const queryText = 'INSERT INTO envelopes VALUES ($1, $2, $3, $4);'
        await db.query(queryText, [newE.envelope_id, newE.envelope_name, newE.current_value, newE.budgeted_value]);
        envelopes.push(newE);
        res.status(200).send(envelopes);
    }
});

//Seems to work as expected.
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
        await db.query(deleteQuery, [target]);

        res.status(200).send();
    }
});

//PUT route to update values of an envelope
envRouter.put('/:id', isValidEnvelope, async (req, res, next) => {
    if(!req.IDMatch){ //valid envelope but ID doesn't match
        req.isValid = false; 
        req.validReason = 'ID does not exist yet. Make a new envelope with this ID before Updating it.'
    }
    if(!req.isValid){
        res.status(400).send(req.validReason);
    } else {    
        const newE = req.body;
        const newID = newE.envelope_id;
        const newName = newE.envelope_name;
        const newValue = newE.current_value;
        const newBudget = newE.budgeted_value;
        const queryText = 'UPDATE envelopes SET envelope_name = $2, budgeted_value = $3 WHERE envelope_id = $1;'
        await db.query(queryText, [newID, newName, newBudget]);
        res.status(200).send();
    }
});

envRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = envRouter;