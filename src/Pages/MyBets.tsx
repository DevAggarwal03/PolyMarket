import React from 'react';
import { TrendingUp, ArrowDownToLine, Brain, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';

interface Bet {
  id: number;
  predictionId: number;
  question: string;
  betAmount: number;
  position: 'yes' | 'no';
  odds: number;
  potentialPayout: number;
  timestamp: string;
  status: 'active' | 'resolved' | 'withdrawn';
  aiAnalysis: string;
}

function MyBets() {
  const [bets] = React.useState<Bet[]>([
    {
      id: 1,
      predictionId: 1,
      question: "Will Bitcoin reach $100,000 by the end of 2024?",
      betAmount: 500,
      position: 'yes',
      odds: 0.65,
      potentialPayout: 769.23,
      timestamp: "2024-03-15T10:30:00Z",
      status: 'active',
      aiAnalysis: "Market sentiment remains bullish with strong institutional adoption trends."
    },
    {
      id: 2,
      predictionId: 2,
      question: "Will SpaceX successfully land on Mars in 2024?",
      betAmount: 200,
      position: 'no',
      odds: 0.70,
      potentialPayout: 285.71,
      timestamp: "2024-03-14T15:45:00Z",
      status: 'active',
      aiAnalysis: "Recent technical setbacks suggest timeline delays are likely."
    }
  ]);

  const [showAiAnalysis, setShowAiAnalysis] = React.useState<Record<number, boolean>>({});

  const toggleAiAnalysis = (betId: number) => {
    setShowAiAnalysis(prev => ({
      ...prev,
      [betId]: !prev[betId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'resolved':
        return 'text-blue-400';
      case 'withdrawn':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8" />
            My Bets
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Total Active Bets:</span>
              <span className="ml-2 font-semibold">{bets.filter(bet => bet.status === 'active').length}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Total Amount Staked:</span>
              <span className="ml-2 font-semibold">
                ${bets.reduce((sum, bet) => sum + bet.betAmount, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {bets.map(bet => (
            <div key={bet.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{bet.question}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(bet.timestamp)}
                    </span>
                    <span className={`capitalize ${getStatusColor(bet.status)}`}>
                      • {bet.status}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">
                  <ArrowDownToLine className="w-4 h-4" />
                  Withdraw Bet
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Position</div>
                  <div className={`font-semibold ${bet.position === 'yes' ? 'text-green-400' : 'text-red-400'}`}>
                    {bet.position.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Bet Amount</div>
                  <div className="font-semibold">${bet.betAmount}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Potential Payout</div>
                  <div className="font-semibold text-purple-400">${bet.potentialPayout}</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <button 
                  className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                  onClick={() => toggleAiAnalysis(bet.id)}
                >
                  <Brain className="w-4 h-4" />
                  {showAiAnalysis[bet.id] ? 'Hide AI Analysis' : 'Show AI Analysis'}
                </button>
                
                <a 
                  href={`/prediction/${bet.predictionId}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                >
                  <span>View Prediction</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {showAiAnalysis[bet.id] && (
                <div className="mt-4 bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-300">{bet.aiAnalysis}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBets;