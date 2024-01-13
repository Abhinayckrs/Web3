import React,{useEffect, useState} from 'react';
import {ethers} from 'ethers';


import { contractABI,contractAddress } from '../utils/constants';

export const TransactionContext =React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    //const provider = new ethers.providers.Web3Provider(ethereum);
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = provider.getSigner();
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

    const handleChange = (e,name) => {
        setFormData((prevState) => ({...prevState,[name]:e.target.value}));
    }

    const checkIfWalletIsConnected = async () =>{

        try{
            if(!ethereum) return alert("Please install MetaMask");

        const accounts = await ethereum.request({ method: 'eth_accounts'});

        if(accounts.length){
            setCurrentAccount(accounts[0]);

            //get All the transactions

        }else{
            console.log('No accounts found');
        }

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
            const parsedAmount = ethers.parseEther(amount);

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

            console.log("Before sending transaction to smart contract...");

            const tranactionHash =await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);
    

            console.log("Transaction sent. Transaction Hash:", transactionHash);

            setIsLoading(true);
            console.log(`Loading - ${tranactionHash.hash}`);
            await tranactionHash.wait();

            setIsLoading(false);
            console.log(`Success - ${tranactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
            
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum Object.")
            
        }
    }

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []); 
    
    

    return (
        <TransactionContext.Provider value={{connectWallet,currentAccount,formData,setFormData,handleChange,sendTransaction,transactionCount,isLoading}}>
            {
                children
            }
        </TransactionContext.Provider>
    );
}

 