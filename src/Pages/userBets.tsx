import { useState } from 'react';
import { Brain, TrendingUp, AlertCircle, ArrowDownToLine, BellRing, Wallet } from 'lucide-react';
import MyBets from './MyBets';
import Navbar from '../components/Navbar';

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

  if (showMyBets) {
    return <MyBets />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 gap-y-10 flex flex-col">
        <Navbar/>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Prediction Market
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMyBets(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Wallet className="w-5 h-5" />
              My Bets
            </button>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
              <BellRing className="w-5 h-5" />
              Subscribe to AI Agent
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {predictions.map(prediction => (
            <div key={prediction.id} className="bg-gray-800 rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">{prediction.question}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yes Pool: ${prediction.yesPool}</span>
                    <span className="text-green-400">Odds: {((prediction.yesPool / (prediction.yesPool + prediction.noPool)) * 100).toFixed(1)}%</span>
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
                    <span>No Pool: ${prediction.noPool}</span>
                    <span className="text-red-400">Odds: {((prediction.noPool / (prediction.yesPool + prediction.noPool)) * 100).toFixed(1)}%</span>
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
                  <p className="text-sm text-gray-300">{prediction.aiAnalysis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserBets;