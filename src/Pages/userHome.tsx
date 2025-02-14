import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertCircle, ArrowDownToLine, Loader2} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAccount, useReadContract } from 'wagmi';
import { ABI, contractAddress } from '../utils/contractDetails';
import SubscribeButton from '../components/AgentButton';
import { formatGwei } from 'viem';

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
  const [predictions, setPredictions] = useState<Prediction[] | []>([]);

  const [bets, setBets] = useState<Record<number, { yes: string; no: string }>>({});
  const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});
  
  const {address} = useAccount();

  const {data : agentStatus , isPending : agentPending, isSuccess : agentSuccess} = useReadContract({
    abi : ABI,
    address : contractAddress,
    functionName : "isSubscribed",
    account : address
  })
  
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

  const {data: questions} = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "getAllQuestions",
    args: [],
    account: address,
  })

  // if(questionsPending){
  //   return <div className='flex justify-center bg-gray-900 text-gray-100 items-center w-screen h-screen'>
  //     ...Loading
  //   </div>
  // }

  // if(questionsSuccess){
  //   setPredictions(questions as unknown as Prediction[]);
  // }

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
                <h2 className="text-xl font-semibold">{prediction.question}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Yes Pool: ${prediction.yesVotes}</span>
                      <span className="text-green-400">Odds: {((parseInt(prediction.yesVotes.toString())  / (parseInt(prediction.yesVotes.toString()) + parseInt(prediction.noVotes.toString()))) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Bet amount for Yes"
                        className="flex-1 bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={bets[prediction.id]?.yes || ''}
                        onChange={(e) => handleBetChange(prediction.id, 'yes', e.target.value)}
                      />
                      <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                        Bet Yes
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>No Pool: ${prediction.noVotes}</span>
                      <span className="text-red-400">Odds: {((parseInt(prediction.noVotes.toString()) / (parseInt(prediction.yesVotes.toString()) + parseInt(prediction.noVotes.toString()))) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Bet amount for No"
                        className="flex-1 bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={bets[prediction.id]?.no || ''}
                        onChange={(e) => handleBetChange(prediction.id, 'no', e.target.value)}
                      />
                      <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors">
                        Bet No
                      </button>
                    </div>
                  </div>
                </div>
  
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <button 
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                    onClick={() => toggleAiAnalysis(prediction.id)}
                  >
                    <Brain className="w-4 h-4" />
                    {showAiAnalysis[prediction.id] ? 'Hide AI Analysis' : 'Show AI Analysis'}
                  </button>
                  
                  <button className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">
                    <ArrowDownToLine className="w-4 h-4" />
                    Withdraw Bet
                  </button>
                </div>
  
                {showAiAnalysis[prediction.id] && (
                  <div className="mt-4 bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-300">ai analysis</p>
                  </div>
                )}
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