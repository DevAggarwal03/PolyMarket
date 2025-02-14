import MyBets from './MyBets';
import Navbar from '../components/Navbar';
import { ABI, contractAddress } from '../utils/contractDetails';
import { useAccount, useReadContracts } from 'wagmi';
import { Abi } from 'viem';
import { Bet } from './MyBets';


function UserBets() {

  const {address} = useAccount();

  const {data} = useReadContracts({
    contracts: [
      {
        address: contractAddress as `0x${string}`,
        abi: ABI as Abi,
        functionName: "getAddressQuestionAmounts",
        args: [address]
      },
      {
        address: contractAddress as `0x${string}`,
        abi: ABI as Abi,
        functionName: "getAllQuestions",
        args: []
      }
    ]
  })

  console.log("All user bets:", data?.[0]);
  console.log("All questions:", data?.[1]);

  const betsByUser : Bet[] = data ? (data?.[0].result as any[])?.filter((bet) => !((bet.noVotes === bet.yesVotes) && (bet.yesVotes === BigInt(0)))).map((bet) => {
    const matchingQuestion = (data[1].result as any[]).find(
      (question) => question.id === bet.questionId
    );
    if(matchingQuestion){
      return {
        userYesVotes : bet.yesVotes,
        userNoVotes : bet.noVotes,
        ...matchingQuestion
      }
    }
  }) : [];

  console.log(betsByUser);

  return (
    <>
    <Navbar/>
    {
      betsByUser.length > 0 && (
        <MyBets betsByUser={betsByUser}/>
      )
    }
    </>
  );
}

export default UserBets;