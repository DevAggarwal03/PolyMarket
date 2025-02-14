import { useState } from 'react';
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

  const [bets, setBets] = useState<Record<number, { yes: string; no: string }>>({});
  const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});
  const {address} = useAccount();

  const {data: userBets} = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "addressToQuestionIdToAmt",
    args: [address]
  })
  
  console.log(userBets);
  
  const {data: questions} = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "idToQuestion",
    args: [BigInt(1)]
  })
  
  console.log(questions);


  // let userBets be an array of objects with key as questionId and value as an object with keys yes and no
 
  const contractsToRead = userBets ? Object.keys(userBets as unknown as Record<string, any>).map((questionId) => ({
    address: contractAddress as `0x${string}`,
    abi: ABI as Abi,
    functionName: "idToQuestion",
    args: [BigInt(questionId)]
  })) : []

  const {data: allBetQuestions} = useReadContracts({
    contracts: contractsToRead
  })

  console.log(allBetQuestions);
  

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
    <MyBets allBetQuestions={allBetQuestions as any[]}/>
    </>
  );
}

export default UserBets;