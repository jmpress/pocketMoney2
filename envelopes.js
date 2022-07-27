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
function isValidEnvelope(req, res, next){
    req.targetLabel = req.query.name;
    req.targetBudget = req.query.value;
    let targetIndex = -1;
    for(let i = 0; i < envelopes.length; i++){
        if(envelopes[i].name === req.targetLabel){
            targetIndex = i;
        }
    }
    req.index = targetIndex;
    next();
}


envRouter.get('/', (req, res, next) => {
    res.status(200).send(envelopes);
});

envRouter.post('/', isValidEnvelope, (req, res, next) => {
    if(req.index !== -1 || req.targetBudget < 0){
        res.status(400).send();
    } else if(req.targetLabel && req.targetBudget){
        const newEnvelope = {
            envelope_name: req.targetLabel,
            current_value: 0,
            budgeted_value: req.targetBudget,
            isincome: false
        }
        envelopes.push(newEnvelope);
        res.status(201).send(envelopes);
    } else {
        res.status().send();
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