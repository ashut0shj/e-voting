import { BrowserProvider, Contract } from "ethers";


const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
    "event MemberJoined(address indexed,uint256)",
    "event VoteCreated(address indexed,uint256 indexed,uint256,uint256)",
    "event Voted(address indexed,uint256 indexed,uint256 indexed,uint256)",
    "function createVote(string,uint256,uint256)",
    "function didVote(address,uint256) view returns (bool)",
    "function getVote(uint256) view returns (string,address,uint256[],uint256)",
    "function join()",
    "function vote(uint256,uint256)"
  ]


  const provider = new BrowserProvider(window.ethereum);
  export const connect = async () => {
    await provider.send("eth_requestAccounts", []);
    return getContract(provider);
};

export const getContract = async (provider) => {
    const signer = await provider.getSigner();
    const contract = new Contract(address, abi, signer);
    return { signer, contract };
};