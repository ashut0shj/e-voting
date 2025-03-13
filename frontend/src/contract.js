import { BrowserProvider, Contract } from "ethers";
const getProvider = () => new BrowserProvider(window.ethereum); // ✅ Define provider function

const address = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
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

export const connect = async () => {
    const provider = getProvider();  // ✅ Call provider function
    await provider.send("eth_requestAccounts", []);
    return getContract(provider);
};

export const getContract = async (provider) => {  // ✅ Pass provider explicitly
    const signer = await provider.getSigner();  // ✅ getSigner() is async
    const contract = new Contract(address, abi, signer);  // ✅ Correct instantiation
    return { signer, contract };
};