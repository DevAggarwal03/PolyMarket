import { TrendingUp, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAccount, useReadContract } from 'wagmi';
import { ABI, contractAddress } from '../utils/contractDetails';
import SubscribeButton from '../components/AgentButton';
import BetCard from '../components/betCard';

interface Prediction {
  id: number;
  question: string;
  cryptoCurrency: string;
  endTime: number;
  isActive: boolean;
  description: string;
  yesVotes: number;
  noVotes: number;
}

function Questions() {

  const {address} = useAccount();

  const {data : agentStatus , isPending : agentPending, isSuccess : agentSuccess} = useReadContract({
    abi : ABI,
    address : contractAddress,
    functionName : "isSubscribed",
    account : address
  })

  const {data: questions} = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "getAllQuestions",
    args: [],
    account: address,
  })

  if(agentPending){
    return <div className='flex justify-center bg-gray-900 text-gray-100 items-center w-screen h-screen'>
      <Loader2/>
    </div>
  }
  if(!agentPending && agentSuccess){
    return (
      <div>
          <Navbar/>
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              Prediction Market
            </h1>
            {
              agentStatus === true ? (<div className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors'>Agent In Use</div>) : (<SubscribeButton/>)
            }
          </div>
  
          <div className="space-y-6">
            {(questions as unknown as Prediction[])?.map(prediction => (
              <div key={prediction.id} className="bg-gray-800 rounded-lg p-6 space-y-4">
              <BetCard prediction = {prediction}/>
              </div>
            )
            )}
          </div>
        </div>
      </div>
      </div>
    );
  }
}

export default Questions