import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertCircle, ArrowDownToLine, BellRing, Wallet } from 'lucide-react';
import MyBets from './MyBets';
import Navbar from '../components/Navbar';
import { ABI, contractAddress } from '../utils/contractDetails';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { Abi } from 'viem';
interface Prediction {
  id: number;
  question: string;
  yesPool: number;
  noPool: number;
  aiAnalysis: string;
}
import { Bet } from './MyBets';


function UserBets() {
  const [showMyBets, setShowMyBets] = useState(false);
  const [predictions] = useState<Prediction[]>([
    {
      id: 1,
      question: "Will Bitcoin reach $100,000 by the end of 2024?",
      yesPool: 5000,
      noPool: 3000,
      aiAnalysis: "Based on current market trends and historical data, there's a 65% probability of this occurring."
    },
    {
      id: 2,
      question: "Will SpaceX successfully land on Mars in 2024?",
      yesPool: 2000,
      noPool: 8000,
      aiAnalysis: "Technical challenges and timeline analysis suggest a 30% likelihood of success."
    }
  ]);

  const [bets, setBets] = useState<Bet[] | []>([]);
  const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});
  const {address} = useAccount();

  const {data , isPending , isSuccess} = useReadContracts({
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

  const betsByUser : Bet[] = data ? (data[0].result as any[]).map((bet) => {
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
  

  const handleBetChange = (predictionId: number, type: 'yes' | 'no', value: string) => {
    setBets(prev => ({
      ...prev,
      [predictionId]: {
        ...(prev[predictionId] || { yes: '', no: '' }),
        [type]: value
      }
    }));
  };

  const toggleAiAnalysis = (predictionId: number) => {
    setShowAiAnalysis(prev => ({
      ...prev,
      [predictionId]: !prev[predictionId]
    }));
  };

  

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