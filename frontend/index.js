import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import OrganicProduceSupplyChain from '../artifacts/contracts/OrganicProduceSupplyChain.sol/OrganicProduceSupplyChain.json' with { type: 'json' };

const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);
let targetAddress = "";
let selectedProduce = "";

export async function initialize() {

    const FARMER_ROLE = ethers.utils.id("ROLE_FARMER");
    const AGGREGATOR_ROLE = ethers.utils.id("ROLE_AGGREGATOR");
    const RETAILER_ROLE = ethers.utils.id("ROLE_RETAILER");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const isFarmer = await contract.hasRole(FARMER_ROLE, address);
    const isAggregator = await contract.hasRole(AGGREGATOR_ROLE, address);
    const isRetailer = await contract.hasRole(RETAILER_ROLE, address);

    document.getElementById('farmerFunctions').style.display = isFarmer ? 'block' : 'none';
    document.getElementById('aggregatorFunctions').style.display = isAggregator ? 'block' : 'none';
    document.getElementById('retailerFunctions').style.display = isRetailer ? 'block' : 'none';

    if (isFarmer) {
        getAllAggregators();
    } else if (isAggregator) {
        getAllRetailers();
    }

    getUsersProduce();

}

export async function createProduce() {

    const name = document.getElementById("produceName").value;
    const amount = document.getElementById("produceAmount").value;
    if (!window.ethereum) return alert("MetaMask is required!");

    await contract.createProduce(name, amount);
}

async function getAllAggregators() {
    if (!window.ethereum) return alert("MetaMask is required!");

    let data = await contract.getAllAggregators();

    let addresses = data[0];
    let usernames = data[1];

    document.getElementById("usersTitle").innerText = "All aggregators (click to select)";
    document.getElementById("usersDisplay").innerHTML = "";

    for(var i = 0; i < addresses.length; i++) {
        const row = document.createElement('div');
        row.textContent = usernames[i];
        row.setAttribute('data-id', addresses[i]);
        row.style.cursor = 'pointer';
        
        row.addEventListener('click', function() {
            targetAddress = this.dataset.id;
            console.log('Selected address:', targetAddress);
            document.querySelector("#farmerFunctions .recipientAddress").value = targetAddress;
        });

        document.getElementById("usersDisplay").appendChild(row);
    }

}

async function getAllRetailers() {
    if (!window.ethereum) return alert("MetaMask is required!");

    let data = await contract.getAllRetailers();

    let addresses = data[0];
    let usernames = data[1];

    document.getElementById("usersTitle").innerText = "All retailers (click to select)";
    document.getElementById("usersDisplay").innerHTML = "";

    for (var i = 0; i < addresses.length; i++) {
        const row = document.createElement('div');
        row.textContent = usernames[i];
        row.setAttribute('data-id', addresses[i]);
        row.style.cursor = 'pointer';

        row.addEventListener('click', function() {
            targetAddress = this.dataset.id;
            console.log('Selected address: ', targetAddress);
            document.querySelector("#aggregatorFunctions .recipientAddress").value = targetAddress;
        });

        document.getElementById("usersDisplay").appendChild(row);
    }
    
}

export async function getAnyProduceHistory() {
    if (!window.ethereum) return alert("MetaMask is required!");

    let id = document.getElementById("historyInput").value;
    let data = await contract.getProduceHistory(id);

    document.getElementById("historyDisplay").innerText = "";
    for (var d of data) {
        let history = parseHistory(d);
        document.getElementById("historyDisplay").innerText += history;
        document.getElementById("historyDisplay").innerText += '\n';
    }
}

async function getProduceHistory(id) {
    if (!window.ethereum) return alert("MetaMask is required!");
    
    let data = await contract.getProduceHistory(id);

    document.getElementById("historyDisplay").innerText = "";
    for (var d of data) {
        let history = parseHistory(d);
        document.getElementById("historyDisplay").innerText += history;
        document.getElementById("historyDisplay").innerText += '\n';
    }
}

contract.on('ProduceCreated', (name, owner, amount, timestamp, status) => {
    getUsersProduce();
});


async function getUsersProduce() {
    if (!window.ethereum) return alert("MetaMask is required!");
    
    let data = await contract.getUserProduce();
    console.log(data);

    document.getElementById("allProduceDisplay").innerText = "";

    for(var i = 0; i < data.length; i++) {
        const row = document.createElement('div');
        row.textContent = "id: " + data[i].id + ", owner: " + data[i].currentOwner + ", amount: " + data[i].amount;
        row.setAttribute('data-id', data[i].id);
        row.style.cursor = 'pointer';
        
        row.addEventListener('click', function() {
            getProduceHistory(this.dataset.id);
            document.querySelector("#farmerFunctions .produceId").value = this.dataset.id;
            document.querySelector("#aggregatorFunctions .produceId").value = this.dataset.id;
            document.querySelector("#retailerFunctions .produceId").value = this.dataset.id;
        });

        document.getElementById("allProduceDisplay").appendChild(row);
    }
}

export async function displayProduce() {
    if (!window.ethereum) return alert("MetaMask is required!");
    
    let data = await contract.getAllProduce();
    console.log(data);

    document.getElementById("allProduceDisplay").innerText = "";
    for (var d of data) {
        document.getElementById("allProduceDisplay").innerText += d;
        document.getElementById("allProduceDisplay").innerText += '\n';
    }
}

function parseHistory(history) {
    let parsedHistory = {};

    parsedHistory.owner = history.owner;
    parsedHistory.status = history.status;

    const date = new Date(history.timestamp * 1000);
    parsedHistory.timestamp = date.toLocaleString(); 

    return parsedHistory.owner + ", " + parsedHistory.timestamp + ", " + parsedHistory.status;
}

export async function transferProduceToAggregator() {
    if (!window.ethereum) return alert("MetaMask is required!");

    const id = document.querySelector("#farmerFunctions .produceId").value;
    const address = document.querySelector("#farmerFunctions .recipientAddress").value;
    if (!id || !address) {
        return alert("Produce id and recipient address are required!");
    }

    await contract.transferProduceToAggregator(id, address);
}

export async function transferProduceToRetailer() {
    
    if (!window.ethereum) return alert("MetaMask is required!");

    const id = document.querySelector("#aggregatorFunctions .produceId").value;
    const address = document.querySelector("#aggregatorFunctions .recipientAddress").value;
    if (!id || !address) {
        return alert("Produce id and recipient address are required!");
    }

    await contract.transferProduceToRetailer(id, address);
}

export async function soldToCustomer() {
    
    if (!window.ethereum) return alert("MetaMask is required!");

    const id = document.querySelector("#retailerFunctions .produceId").value;
    if (!id) {
        return alert("Produce id and recipient address are required!");
    }

    await contract.soldToCustomer(id);
}

const showAccount = document.querySelector(".showAccount");
export async function getAccount() {
const accounts = await window.ethereum 
    .request({ method: "eth_requestAccounts" })
    .catch((err) => {
        if (err.code === 4001) {
        console.log("Please connect to MetaMask.");
        } else {
        console.error(err);
        }
    });
    const account = accounts[0];
    showAccount.innerHTML = account;
}
