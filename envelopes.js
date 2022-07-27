const express = require('express');
const envRouter = express.Router();

const envelopes = [
    {
        envelope_id: 0,
        envelope_name: 'Salary',
        current_value: 2000,
        budgeted_value: 2000,
        isincome: true
    },
    {
        envelope_id: 1,
        envelope_name: 'Rent',
        current_value: 1000,
        budgeted_value: 1000,
        isincome: false
    },
    {
        envelope_id: 2,
        envelope_name: 'Food',
        current_value: 500,
        budgeted_value: 500,
        isincome: false
    }

];
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
    console.log("made it to validation beginning");
    req.envelopeID = req.body.envelope_id;

    req.envelopeName = req.body.envelope_name;
    req.envelopeCurrentValue = req.body.current_value;
    req.envelopeBudgetedValue = req.body.budgeted_value
    req.isIncome = req.body.isincome;
    console.log("made it to validation post variables");
    //What's the actual logic to validate an envelope object

    //Assume true:
    req.isValid = true;

    //Make sure budget > 0
    if(req.envelopeBudgetdValue<=0){
        req.isValid = false;
    }

    //make sure isincome has a value
    if(req.isIncome === undefined){req.isValid = false;}

    //Make sure the ID isn't already taken
    //Make sure the name isn't aleady take
    for(let i = 0; i < envelopes.length; i++){
        if(envelopes[i].envelope_id === req.envelopeID || envelopes[i].envelope_name === req.envelopeName){
            req.isValid = false;
        }
    }
    console.log(`made it to validation end: isValid = ${req.isValid}`);
    next();
}

//Works
envRouter.get('/', (req, res, next) => {
    res.status(200).send(envelopes);
});

envRouter.post('/', isValidEnvelope, (req, res, next) => {
    console.log("made it to post-validation, start of POST");
    if(!req.isValid){
        res.status(400).send();
    } else{    
        envelopes.push(req.body);
        res.status(201).send(envelopes);
    }
});

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

envRouter.delete('/', isValidEnvelope, (req, res, next) => {
    if(req.index === -1){
        res.status(404).send();
    } else {
        //otherwise, remove it from the array (splice)
        envelopes.splice(req.index, 1);
        res.status(200).send(envelopes);    
    }
});

envRouter.use((err, req, res, next) => {
    console.log(err.message);
    res.status(err.status).send(err.message);
})

module.exports = envRouter;