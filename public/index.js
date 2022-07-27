//Fetch variables
let headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

//Display Areas
    const expenseDisplayArea = document.getElementById("expenseDisplayArea");
    const incomeDisplayArea = document.getElementById("incomeDisplayArea");
    const errorDisplayArea = document.getElementById("errorDisplayArea");
    const transactionDisplayArea = document.getElementById("transactionDisplayArea");
    const buttonUIArea = document.getElementById("buttonUIArea");

//Button Assignment
    //Envelopes
    const makeNewEnvelopeButton = document.getElementById("makeNewEnvelopeButton");

    //Transactions
    const makeNewTransactionButton = document.getElementById("makeNewTransactionButton")

//Text Field Assignment
    //Envelopes
    const newEnvelopeID = document.getElementById("newEnvelopeID");
    const newEnvelopeName = document.getElementById("newEnvelopeName")
    const newEnvelopeBudget = document.getElementById("newEnvelopeBudget")
    const newIsIncome = document.getElementById("newIsIncome")
    //Transactions

// Object collection arrays
    let envelopes = [];
    let transactions = [];

// Functions to Get Envelopes and Transactions
async function getAllEnvelopes(){
    const response = await fetch('/envelopes');
    if(response.ok){
        envelopes = await response.json();
        displayAllEnvelopes();
        errorDisplayArea.innerHTML = "Got";
    }
};

async function getAllTransactions(){
    const response = await fetch('/transactions');
    if(response.ok){
        transactions = await response.json();
        displayAllTransactions();
        errorDisplayArea.innerHTML = "Got";
    }
};

//Display all Envelopes and Transactions
function displayAllEnvelopes(){
    let displayIncomeEnvelopes = "Income<br><table><tr><th>ID</th><th>Name</th><th>Current Value</th><th>Budgeted Value</th></tr>";
    let displayExpenseEnvelopes = "Expenses<br><table><tr><th>ID</th><th>Name</th><th>Current Value</th><th>Budgeted Value</th></tr>";
    
    envelopes.forEach(envelope => {
        if(envelope.isincome){
            displayIncomeEnvelopes = displayIncomeEnvelopes + `<tr><td>${envelope.envelope_id}</td><td>${envelope.envelope_name}</td><td>${envelope.current_value}</td><td>${envelope.budgeted_value}</td>`;
        } else {
            displayExpenseEnvelopes = displayExpenseEnvelopes + `<tr><td>${envelope.envelope_id}</td><td>${envelope.envelope_name}</td><td>${envelope.current_value}</td><td>${envelope.budgeted_value}</td>`;
        }
        
    });
    displayIncomeEnvelopes += "</table>";
    displayExpenseEnvelopes += "</table>";
    incomeDisplayArea.innerHTML=displayIncomeEnvelopes;
    expenseDisplayArea.innerHTML=displayExpenseEnvelopes;   
}

function displayAllTransactions(){
    let displayTransactions = "<table><tr><th>Txn</th><th>Amount</th><th>From Env</th><th>Paid to</th><th>Date</th></tr>";
    
    transactions.forEach(transaction => {
        displayTransactions = displayTransactions + `<tr><div id="transaction${transaction.transaction_id}"><td>${transaction.transaction_id}</td><td>${transaction.payment_amount}</td><td>${transaction.wd_envelope_id}</td><td>${transaction.payment_recipient}</td><td>${transaction.transaction_date}</td></tr>`;
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

makeNewEnvelopeButton.addEventListener('click', async () =>{
    const newEnvelope = {
        envelope_id: newEnvelopeID.value,
        envelope_name: newEnvelopeName.value,
        current_value: 0,
        budgeted_value: newEnvelopeBudget.value,
        isincome: newIsIncome.checked
    };
    console.log(newEnvelope);
    const response = await fetch(`/envelopes`, {method: 'POST', headers: headers, body: JSON.stringify(newEnvelope)});
    if(response.ok){
        errorDisplayArea.innerHTML = "Added!"
        envelopes = await response.json();
        displayAllEnvelopes();
    }
    displayAllEnvelopes();
    //Using input data from targetEnvelopeName and targetEnvelopeBudget, make a POST request
    //to create a new envelope object and add it to the array.
    
});


/*
updateOneButton.addEventListener('click', async () =>{
    //Using input data from input fields, make a PUT request to update an envelope
    const updateEnvelope = targetEnvelopeName.value;
    const updateMoney = targetEnvelopeBudget.value;
    const response = await fetch(`/envelopes?name=${updateEnvelope}&value=${updateMoney}`, {method: 'PUT'});
    if(response.ok){
        envelopes = await response.json();
        errorDisplayArea.innerHTML = "Updated";
        displayAllEnvelopes();
    }
});


deleteOneButton.addEventListener('click', async () =>{
    const targetEnvelope = targetEnvelopeName.value;
    const targetBudget = targetEnvelopeBudget.value;
    const response = await fetch(`/envelopes?name=${targetEnvelope}&value=${targetBudget}`, {method: 'DELETE'});
    console.log(response.ok);
    if(response.ok){
        errorDisplayArea.innerHTML = "Deleted!"
        envelopes = await response.json();
        console.log(envelopes);
        displayAllEnvelopes();     
    }
   
});
*/

