import React, {useState, useEffect} from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';

import {VotingAddress, VotingAddressABI} from './constants';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

    export const VotingContext = React.createContext();
    export const VotingProvider = ({children}) =>{
        
        const votingTitle = "Voting hurray";
        return (
            <VotingContext.Provider value={{}}>
                {children}
            </VotingContext.Provider>
        )
    } 

//maybe remove this
// const Voter = () => {
//   return (
//     <div>Voter</div>
//   )
// }
