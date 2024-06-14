import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import OrganicProduceSupplyChain from '../artifacts/contracts/OrganicProduceSupplyChain.sol/OrganicProduceSupplyChain.json' with { type: 'json' };

const contractAddress = "0x67d269191c92Caf3cD7723F116c85e6E9bf55933";

export async function createProduce() {

    const name = document.getElementById("produceName").value;
    const amount = document.getElementById("produceAmount").value;
    if (!window.ethereum) return alert("MetaMask is required!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);

    await contract.createProduce(name, amount);
}

export async function getAllUsers() {
    if (!window.ethereum) return alert("MetaMask is required!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);

    let data = await contract.users();
    console.log(data);

    document.getElementById("allUsersDisplay").innerText = data;
}

export async function getProduceHistory() {
    if (!window.ethereum) return alert("MetaMask is required!");

    const id = document.getElementById("historyInput").value;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);
  
    let data = await contract.getProduceHistory(id);
    console.log(data);

    document.getElementById("historyDisplay").innerText = data;
}

export async function displayProduce() {
    if (!window.ethereum) return alert("MetaMask is required!");
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);
  
    let data = await contract.getAllProduce();
    console.log(data);

    for (var d of data) {
        document.getElementById("allProduceDisplay").innerText += d;
        document.getElementById("allProduceDisplay").innerText += '\n';
    }

    
}

export async function transferProduce() {
    const id = document.getElementById("produceId").value;
    const address = document.getElementById("recipientAddress").value;
    const status = document.getElementById("produceStatus").value;
    if (!window.ethereum) return alert("MetaMask is required!");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, OrganicProduceSupplyChain.abi, signer);

    await contract.transferProduce(id, address, status);
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
