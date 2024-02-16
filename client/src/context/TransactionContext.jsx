import React,{useEffect, useState} from 'react';
import {ethers} from 'ethers';

import { contractABI,contractAddress } from '../utils/constants';

export const TransactionContext =React.createContext();

const { ethereum } = window;

/*const  getEthereumContract = async  () => {
   // const provider = new ethers.providers.Web3Provider(ethereum);
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress,contractABI,signer);

    console.log({
        provider,
        signer,
        transactionContract
    });
    
    
    
    return transactionContract;
}*/


const  getEthereumContract =   () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    // const provider = new ethers.BrowserProvider(ethereum);
     const signer =  provider.getSigner();
     const transactionContract = new ethers.Contract(contractAddress,contractABI,signer);
 
    /* console.log({
         provider,
         signer,
         transactionContract
     });
     */
     
     
     return transactionContract;
 }

export const TransactionProvider = ({children}) => {

    const[currentAccount,setCurrentAccount] = useState("");
    const [formData,setFormData] = useState({addressTo: '',amount: '',keyword: '',message: ''});
    const [isLoading,setIsLoading] = useState(false);
    const [transactionCount,setTransactionCount] =useState(localStorage.getItem('transactionCount'));
    const [transactions,setTransactions] = useState([]);

    const handleChange = (e,name) => {
        setFormData((prevState) => ({...prevState,[name]:e.target.value}));
    }

    const getAllTransactions = async () => {
        try{
            if(!ethereum) return alert("Please install MetaMask");
            const transactionContract = getEthereumContract();
            const availableTransactions = await transactionContract.getAllTransactions();

            const structuredTransactions = availableTransactions.map((transaction)=>({
                addressTo: transaction.receiver,
                addressFrom : transaction.sender,
                timestamp:  new Date(transaction.timestamp.toNumber() *1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount : parseInt(transaction.amount._hex) /(10**18)
                
            }))

            const today = new Date().setHours(0, 0, 0, 0);
        const filteredTransactions = structuredTransactions.filter((transaction) => {
            const transactionDate = new Date(transaction.timestamp);
            return transactionDate >= today;
        });
            //console.log("Structured Transactions ",structuredTransactions);
            //console.log("All available Transactions ",availableTransactions);
            setTransactions(filteredTransactions);

        }catch(error){
                console.log(error);
        }
    }

    const checkIfWalletIsConnected = async () =>{

        try{
            if(!ethereum) return alert("Please install MetaMask");

        const accounts = await ethereum.request({ method: 'eth_accounts'});

        if(accounts.length){
            setCurrentAccount(accounts[0]);

            //get All the transactions
            getAllTransactions();

        }else{
            console.log('No accounts found');
        }

        }catch(error){
            console.log(error);

            throw new Error("No ethereum Object.")

        }


        
    }

    const checkIfTransactionsExist = async () => {
        try{
                const transactionContract = getEthereumContract();
                const transactionCount = await transactionContract.getTransactionCount();

                window.localStorage.setItem("transactionCount ",transactionCount);
        }catch(error){
            console.log(error);

            throw new Error("No ethereum Object.")

        }
    } 

    const connectWallet = async () => {
        try{
            if(!ethereum) return alert("Please install MetaMask");

            const accounts = await ethereum.request({ method: 'eth_requestAccounts'});

            setCurrentAccount(accounts[0]);

        } catch(error){
            console.log(error);

            throw new Error("No ethereum Object.")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install MetaMask");

            //get the data from the form
            const { addressTo,amount,keyword,message} =formData;
            const transactionContract =getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            console.log('Parsed Amount: ', parsedAmount.toString());

            await ethereum.request({
                method:'eth_sendTransaction',
                params:[{
                    from:currentAccount,
                    to: addressTo,
                    gas: '0x5208',
                    value:parsedAmount._hex ,
                }],
            });
            console.log("Transactin contract",transactionContract);
            console.log("Before sending transaction to smart contract...");

            const transactionHash =await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);
            
    

            console.log("Transaction sent. Transaction Hash:", transactionHash);

            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());

            window.reload();
            
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum Object.")
            
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []); 
    
    

    return (
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,handleChange,sendTransaction,transactionCount,isLoading,transactions}}>
            {
                children
            }
        </TransactionContext.Provider>
    );
}

 