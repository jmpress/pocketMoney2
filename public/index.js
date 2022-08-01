/*
Problems:
* deletion interface: how to dynamically create the interactable aspect and still attach event handlers that read the target ID?

* When you add a transaction, it should subtract the value from the appropriate envelope.
* Adding a transaction is how you update the current_value of an envelope.
* Any other envelope attributes that need to be changed, must delete envelope and recreate it?

ADMIN MODE
* A toggle with a simple password that unhides a bunch of UI elements for more specific editing.
* When you delete an envelope, what happens to all the transactions that relied on that envelope?
* When you delete a transaction, should it add that value back in? Probably
* ADMIN MODE could allow for envelope attribute updating

*/

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
    const deleteAnEnvelopeButton = document.getElementById("deleteAnEnvelopeButton")

    //Transactions
    const makeNewTransactionButton = document.getElementById("makeNewTransactionButton")

//Text Field Assignment
    //Envelopes
    const newEnvelopeID = document.getElementById("newEnvelopeID");
    const newEnvelopeName = document.getElementById("newEnvelopeName")
    const newEnvelopeBudget = document.getElementById("newEnvelopeBudget")
    const newIsIncome = document.getElementById("newIsIncome")
    //Transactions
    const newTransactionID = document.getElementById("newTransactionID");
    const newTransactionEnvelope = document.getElementById("newTransactionEnvelope");
    const newTransactionAmount = document.getElementById("newTransactionAmount");
    const newTransactionPayee = document.getElementById("newTransactionPayee");
    const newTransactionDate = document.getElementById("newTransactionDate");

// Object collection arrays
    let envelopes = [];
    let transactions = [];

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
    let displayIncomeEnvelopes = "Income<br><table><tr><th>ID</th><th>Name</th><th>Current Value</th><th>Budgeted Value</th><th>Delete</th></tr>";
    let displayExpenseEnvelopes = "Expenses<br><table><tr><th>ID</th><th>Name</th><th>Current Value</th><th>Budgeted Value</th><th>Delete</th></tr>";
    
    envelopes.forEach(envelope => {
        if(envelope.isincome){
            displayIncomeEnvelopes = displayIncomeEnvelopes + `<tr><td>${envelope.envelope_id}</td><td>${envelope.envelope_name}</td><td>${envelope.current_value}</td><td>${envelope.budgeted_value}</td><td><input id="checkDelete" class = "delEnvelope" type = "checkbox" value="${envelope.envelope_id}"></td>`;
        } else {
            displayExpenseEnvelopes = displayExpenseEnvelopes + `<tr><td>${envelope.envelope_id}</td><td>${envelope.envelope_name}</td><td>${envelope.current_value}</td><td>${envelope.budgeted_value}</td><td><input id="checkDelete" class = "delEnvelope" type = "checkbox" value="${envelope.envelope_id}"></td>`;
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

//Envelopes
makeNewEnvelopeButton.addEventListener('click', async () =>{
    const newEnvelope = {
        envelope_id: newEnvelopeID.value,
        envelope_name: newEnvelopeName.value,
        current_value: 0,
        budgeted_value: newEnvelopeBudget.value,
        isincome: newIsIncome.checked
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
    
    const response = await fetch(`/envelopes/${value}`, {method: 'DELETE'}); //THIS LINE doesn't seem to be making the call properly
    console.log(response.ok);
    if(response.ok){
        errorDisplayArea.innerHTML = "Deleted!"
        getAllEnvelopes();
        getAllTransactions();
    } else {
        errorDisplayArea.innerHTML = await response.text();
    }
}


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



*/

