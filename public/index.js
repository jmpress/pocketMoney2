//Fetch variables
let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

//Display Areas
    const expenseDisplayArea = document.getElementById("expenseDisplayArea");
    const errorDisplayArea = document.getElementById("errorDisplayArea");
    const transactionDisplayArea = document.getElementById("transactionDisplayArea");
    const buttonUIArea = document.getElementById("buttonUIArea");

//Button Assignment
    //Paycheck
    const payCheckInput = document.getElementById("payCheckInput");
    //Envelopes
    const makeNewEnvelopeButton = document.getElementById("makeNewEnvelopeButton");
    const deleteAnEnvelopeButton = document.getElementById("deleteAnEnvelopeButton");
    const deleteTransactionButton = document.getElementById("deleteTransactionButton");
    const updateEnvelopeValues = document.getElementById("updateEnvelopeValues");
    const updateTransactionValues = document.getElementById("updateTransactionValues");

    //Transactions
    const makeNewTransactionButton = document.getElementById("makeNewTransactionButton");

//Text Field Assignment
    //Paycheck
    const payCheck = document.getElementById("payCheck");
    //Envelopes
    const newEnvelopeID = document.getElementById("newEnvelopeID");
    const newEnvelopeName = document.getElementById("newEnvelopeName");
    const newEnvelopeBudget = document.getElementById("newEnvelopeBudget");
    //Transactions
    const newTransactionID = document.getElementById("newTransactionID");
    const newTransactionEnvelope = document.getElementById("newTransactionEnvelope");
    const newTransactionAmount = document.getElementById("newTransactionAmount");
    const newTransactionPayee = document.getElementById("newTransactionPayee");
    const newTransactionDate = document.getElementById("newTransactionDate");

// Object collection arrays
    let envelopes = [];
    let transactions = [];
    let paycheckDistro = [];

// Functions to Get Envelopes and Transactions
async function getAllEnvelopes(){
    const response = await fetch('/envelopes');
    if(response.ok){
        envelopes = await response.json();
        displayAllEnvelopes();
    }
};

async function getAllTransactions(){
    const response = await fetch('/transactions');
    if(response.ok){
        transactions = await response.json();
        displayAllTransactions();
    }
};

//Display all Envelopes and Transactions
function displayAllEnvelopes(){
    let displayExpenseEnvelopes = "Expenses<br><table><tr><th>ID</th><th>Name</th><th>Current Value</th><th>Budgeted Value</th><th>Delete</th></tr>";
    
    envelopes.forEach(envelope => {
        displayExpenseEnvelopes = displayExpenseEnvelopes + `<tr><td>${envelope.envelope_id}</td><td>${envelope.envelope_name}</td><td>${envelope.current_value}</td><td>${envelope.budgeted_value}</td><td><input id="checkDelete" class = "delEnvelope" type = "checkbox" value="${envelope.envelope_id}"></td>`;
    });
    displayExpenseEnvelopes += "</table>";
    expenseDisplayArea.innerHTML=displayExpenseEnvelopes;   
}

function displayAllTransactions(){
    let displayTransactions = "<table><tr><th>Txn</th><th>Amount</th><th>From Env</th><th>Paid to</th><th>Date</th><th>Delete</th></tr>";
    
    transactions.forEach(transaction => {
        displayTransactions = displayTransactions + `<tr><div id="transaction${transaction.transaction_id}"><td>${transaction.transaction_id}</td><td>${transaction.payment_amount}</td><td>${transaction.wd_envelope_id}</td><td>${transaction.payment_recipient}</td><td>${transaction.transaction_date}</td><td><input id="checkDelete" class = "delTrans" type = "checkbox" value="${transaction.transaction_id}"></td></tr>`;
    });
    displayTransactions += '</table>';
    transactionDisplayArea.innerHTML=displayTransactions;   
}

//Fetch and display initial data from server.
    getAllEnvelopes();
    displayAllEnvelopes();
    getAllTransactions();
    displayAllTransactions();

//Event Listeners

//Paychecks
payCheckInput.addEventListener('click', async ()=> {
    const income = payCheck.value;
    let totalBudget = 0;    //all dollars budgeted = 100% of the paycheck
    let maxID = 0;  //The highest transaction ID number, so we can insert new transactions starting 1 above that.
    
    for(let i = 0; i < envelopes.length; i++){
        totalBudget += envelopes[i].budgeted_value;
        
    }
    
    for(let l = 0; l < transactions.length; l++){
        if(transactions[l].transaction_id > maxID) { 
            maxID = transactions[l].transaction_id; 
        }
    }

    for(let j = 0; j < envelopes.length; j++){
        //paycheckDistro[x] is assigned a % of the income in proportion to envelope[x] % of the total budget
        paycheckDistro[j] = income * (envelopes[j].budgeted_value / totalBudget);
        paycheckDistro[j] = Math.round(paycheckDistro[j]*100)/100;
        console.log(paycheckDistro[j]);
    }
    
//Test balance splitting
    let sum = 0;
    for(let counter = 0; counter < envelopes.length; counter++){
        sum += paycheckDistro[counter];
    }
    console.log(`Total Budget: ${totalBudget} Paycheck Sum: ${sum}`);
//End Test    

    for(let k = 0; k < paycheckDistro.length; k++){
        const payCheckSplit = {
            transaction_id: maxID+k+1,
            wd_envelope_id: envelopes[k].envelope_id,
            transaction_date: '2020-01-01',  //replace this with today's actual date function
            payment_recipient: 'Income',
            payment_amount: -paycheckDistro[k]
        };
        const response = await fetch(`/transactions`, {method: 'POST', headers: headers, body: JSON.stringify(payCheckSplit)});
        if(response.ok){

        } else {
            errorDisplayArea.innerHTML = await response.text();
        }
    }
    getAllTransactions();
    getAllEnvelopes();
});

//Envelopes
makeNewEnvelopeButton.addEventListener('click', async () =>{
    const newEnvelope = {
        envelope_id: newEnvelopeID.value,
        envelope_name: newEnvelopeName.value,
        current_value: 0,
        budgeted_value: newEnvelopeBudget.value
    };
    const response = await fetch(`/envelopes`, {method: 'POST', headers: headers, body: JSON.stringify(newEnvelope)});
    if(response.ok){
        errorDisplayArea.innerHTML = "Added!"
        envelopes = await response.json();
        displayAllEnvelopes();
    } else {
        errorDisplayArea.innerHTML = await response.text();
    }
});

deleteAnEnvelopeButton.addEventListener('click', () =>{
    var checkedElements = document.querySelectorAll(".delEnvelope:checked");
    var checkedElementsValues = [];
    
    // loop through all checked elements
    checkedElements.forEach(function(element) {
        checkedElementsValues.push(element.value);
    }); 

    if(checkedElementsValues.length == 0)
    	console.log('No items checked');
    else
    	checkedElementsValues.forEach(async (value) => {
            await deleteEnvelope(value);
        });
});

async function deleteEnvelope(value){
    
    const response = await fetch(`/envelopes/${value}`, {method: 'DELETE'});
    console.log(response.ok);
    if(response.ok){
        errorDisplayArea.innerHTML = "Deleted!"
        getAllEnvelopes();
        getAllTransactions();
    } else {
        errorDisplayArea.innerHTML = await response.text();
    }
}

updateEnvelopeValues.addEventListener('click', async () =>{
    //Using input data from input fields, make a PUT request to update an envelope
    const value = newEnvelopeID.value;
    const newEnvelope = {
        envelope_id: newEnvelopeID.value,
        envelope_name: newEnvelopeName.value,
        current_value: null,
        budgeted_value: newEnvelopeBudget.value
    };
    const response = await fetch(`/envelopes/${value}`, {method: 'PUT', headers: headers, body: JSON.stringify(newEnvelope)});
    if(response.ok){
        //envelopes = await response.json();
        errorDisplayArea.innerHTML = "Updated";
        getAllEnvelopes();
    }
});



//Transactions
makeNewTransactionButton.addEventListener('click', async () =>{
    const newTransaction = {
        transaction_id: newTransactionID.value,
        wd_envelope_id: newTransactionEnvelope.value,
        transaction_date: newTransactionDate.value,
        payment_recipient: newTransactionPayee.value,
        payment_amount: newTransactionAmount.value        
    };
    const response = await fetch(`/transactions`, {method: 'POST', headers: headers, body: JSON.stringify(newTransaction)});
    if(response.ok){
        errorDisplayArea.innerHTML = "Added!"
        transactions = await response.json();
        displayAllTransactions();
        getAllEnvelopes();
    } else {
        errorDisplayArea.innerHTML = await response.text();
    }
});

deleteTransactionButton.addEventListener('click', () =>{
    var checkedElements = document.querySelectorAll(".delTrans:checked");
    var checkedElementsValues = [];
    
    // loop through all checked elements
    checkedElements.forEach(function(element) {
        checkedElementsValues.push(element.value);
    }); 

    if(checkedElementsValues.length == 0)
    	console.log('No items checked');
    else
    	checkedElementsValues.forEach(async (value) => {
            await deleteTransaction(value);
        });
});

async function deleteTransaction(value){
    
    const response = await fetch(`/transactions/${value}`, {method: 'DELETE'});
    console.log(response.ok);
    if(response.ok){
        errorDisplayArea.innerHTML = "Deleted!"
        getAllTransactions();
        getAllEnvelopes();
    } else {
        errorDisplayArea.innerHTML = await response.text();
    }
}

updateTransactionValues.addEventListener('click', async () =>{
    //Using input data from input fields, make a PUT request to update an envelope
    const value = newTransactionID.value;
    const newTransaction = {
        transaction_id: newTransactionID.value,
        wd_envelope_id: newTransactionEnvelope.value,
        transaction_date: newTransactionDate.value,
        payment_recipient: newTransactionPayee.value,
        payment_amount: newTransactionAmount.value 
    };
    const response = await fetch(`/transactions/${value}`, {method: 'PUT', headers: headers, body: JSON.stringify(newTransaction)});
    if(response.ok){
        errorDisplayArea.innerHTML = "Updated";
        getAllTransactions();
        getAllEnvelopes();
    }
});