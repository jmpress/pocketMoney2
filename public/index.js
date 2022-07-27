//const updateOneButton = document.getElementById("updateOneButton");
//const makeNewButton= document.getElementById("makeNewButton");
//const deleteOneButton= document.getElementById("deleteOneButton");
//const targetEnvelopeName = document.getElementById("targetEnvelopeName");
//const targetEnvelopeBudget = document.getElementById("targetEnvelopeBudget");
const expenseDisplayArea = document.getElementById("expenseDisplayArea");
const incomeDisplayArea = document.getElementById("incomeDisplayArea");
const errorDisplayArea = document.getElementById("errorDisplayArea");
const transactionDisplayArea = document.getElementById("transactionDisplayArea");
const buttonUIArea = document.getElementById("buttonUIArea");
let envelopes = [];
let transactions = [];



//Make a "get paid" button that adds a numerical value to each envelope based on factors

async function getAllEnvelopes(){
    const response = await fetch('/envelopes');
    if(response.ok){
        envelopes = await response.json();
        displayAllEnvelopes();
        errorDisplayArea.innerHTML = "Got";
    }
};

function displayUI(){
    const newEnvelopeUI = `
    <div>
    ID:<input id="targetEnvelopeID" type = "number">| 
    Name:<input id="targetEnvelopeName" type="string">
    Budget:<input id="targetEnvelopeBudget" type="number">
    Income?<input id=targetIsIncome" type = "checkbox" value ="Income">
    <button id="makeNewEnvelopeButton">Make a new Envelope</button>
    </div>`;
    
    const newTransactionUI = `
    <div width=100%>
    ID:<input id="newTransactionID" type = "number">| 
    Name:<input id="newTransactionName" type="string">
    Budget:<input id="newTransactionAmount" type="number">
    Payee:<input id="newTransactionPayee" type = "string">
    Date:<input id="newTransactionDate" type = "string">
    <button id="makeNewTransactionButton">Record a new transaction</button>
    </div>`;
    buttonUIArea.innerHTML = newEnvelopeUI + '<hr>' + newTransactionUI;
}

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
    displayUI();
}


async function getAllTransactions(){
    const response = await fetch('/transactions');
    if(response.ok){
        transactions = await response.json();
        displayAllTransactions();
        errorDisplayArea.innerHTML = "Got";
    }
};

function displayAllTransactions(){
    let displayTransactions = "<table><tr><th>Txn</th><th>Amount</th><th>From Env</th><th>Paid to</th><th>Date</th></tr>";
    
    transactions.forEach(transaction => {
        displayTransactions = displayTransactions + `<tr><div id="transaction${transaction.transaction_id}"><td>${transaction.transaction_id}</td><td>${transaction.payment_amount}</td><td>${transaction.wd_envelope_id}</td><td>${transaction.payment_recipient}</td><td>${transaction.transaction_date}</td></tr>`;
    });
    displayTransactions += '</table>';
    transactionDisplayArea.innerHTML=displayTransactions;
   
}


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

makeNewButton.addEventListener('click', async () =>{
    const newEnvelope = targetEnvelopeName.value;
    const newBudget = targetEnvelopeBudget.value;
    const response = await fetch(`/envelopes?name=${newEnvelope}&value=${newBudget}`, {method: 'POST'});
    if(response.ok){
        errorDisplayArea.innerHTML = "Added!"
        envelopes = await response.json();
        displayAllEnvelopes();
    }
    //Using input data from targetEnvelopeName and targetEnvelopeBudget, make a POST request
    //to create a new envelope object and add it to the array.
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

getAllEnvelopes();
displayAllEnvelopes();
getAllTransactions();
displayAllTransactions();