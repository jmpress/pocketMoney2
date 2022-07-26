const updateOneButton = document.getElementById("updateOneButton");
const makeNewButton= document.getElementById("makeNewButton");
const deleteOneButton= document.getElementById("deleteOneButton");
const targetEnvelopeName = document.getElementById("targetEnvelopeName");
const targetEnvelopeBudget = document.getElementById("targetEnvelopeBudget");
const expenseDisplayArea = document.getElementById("expenseDisplayArea");
const incomeDisplayArea = document.getElementById("incomeDisplayArea");
const errorDisplayArea = document.getElementById("errorDisplayArea");
const transactionDisplayArea = document.getElementById("transactionDisplayArea");
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

function displayAllEnvelopes(){
    let displayIncomeEnvelopes = "Income\n";
    let displayExpenseEnvelopes = "Expenses\n";
    
    envelopes.forEach(envelope => {
        if(envelope.isincome){
            displayIncomeEnvelopes = displayIncomeEnvelopes + ` ${envelope.name}   |   ${envelope.currentValue}/${envelope.maxCapacity} <br>`;
        } else {
            displayExpenseEnvelopes = displayExpenseEnvelopes + ` ${envelope.name}   |   ${envelope.currentValue}/${envelope.maxCapacity} <br>`;
        }
    });
    incomeDisplayArea.innerHTML=displayIncomeEnvelopes;
    expenseDisplayArea.innerHTML=displayExpenseEnvelopes;
}


async function getAllTransactions(){
    const response = await fetch('/transactions');
    if(response.ok){
        transactions = await response.json();
        displayAllEnvelopes();
        errorDisplayArea.innerHTML = "Got";
    }
};

function displayAllTransactions(){
    let displayTransactions = "";
    
    transactions.forEach(transaction => {
        displayTransactions = displayTransactions + `ID:${transaction.transaction_id}: ${transaction.payment_amount} from ${transaction.wd_envelope_id} paid to ${transaction.payment_recipient} on ${transaction.payment_date}.<br>`;
    });
    incomeDisplayArea.innerHTML=displayIncomeEnvelopes;
    expenseDisplayArea.innerHTML=displayExpenseEnvelopes;
}



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

getAllEnvelopes();
displayAllEnvelopes();
//getAllTransactions();
//displayAllTransactions();