import React from 'react';
import { TrendingUp, ArrowDownToLine, Brain, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import { formatEther, parseEther } from 'viem';

// interface Bet {
//   id: number;
//   predictionId: number;
//   question: string;
//   betAmount: number;
//   position: 'yes' | 'no';
//   odds: number;
//   potentialPayout: number;
//   timestamp: string;
//   status: 'active' | 'resolved' | 'withdrawn';
//   aiAnalysis: string;
// }

export interface Bet {
  id: number;
  question: string;
  description: string;
  endTime: number;
  isActive: boolean;
  cryptoCurrency: string;
  targetPrice: number;
  yesPool: number;
  noPool: number;
  userYesVotes: number;
  userNoVotes: number;
}

function MyBets({betsByUser}: {betsByUser: Bet[]}) {
  // const {address} = useAccount();
  const [showAiAnalysis, setShowAiAnalysis] = React.useState<Record<number, boolean>>({});
  console.log(betsByUser);

  const toggleAiAnalysis = (betId: number) => {
    setShowAiAnalysis(prev => ({
      ...prev,
      [betId]: !prev[betId]
    }));
  };
  
  // const formatDate = (dateString: bigint) => {
  //   return new Date(Number(dateString));
  // };

  const getStatusColor = (status: boolean) => {
    switch (status) {
      case true:
        return 'text-green-400';
      case false:
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const calculatePotentialPayout = (betAmount: number, yesPool: number, noPool: number) => {
    console.log(betAmount, yesPool, noPool);
    const totalPool = yesPool + noPool;
    const yesOdds = yesPool / totalPool;
    const noOdds = noPool / totalPool;
    const payout = yesOdds > noOdds ? betAmount * yesOdds : betAmount * noOdds;
    console.log(payout);
    return formatEther(payout as unknown as bigint);
  }

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
              <span className="text-gray-400">Total Amount Staked:</span>
              <span className="ml-2 font-semibold">{formatEther(((betsByUser[0].userYesVotes) + (betsByUser[0].userNoVotes)) as unknown as bigint)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {betsByUser.map((bet: Bet) => (
            <div key={bet.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">{bet.question}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(parseInt(bet.endTime.toString()) * 1000).toString()}</span>
                    </span>
                    <span className={`capitalize ${getStatusColor(bet.isActive)}`}>
                      • {bet.isActive ? 'Active' : 'Inactive'}
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
                  <div className={`font-semibold ${bet.userYesVotes > bet.userNoVotes ? 'text-green-400' : 'text-red-400'}`}>
                    {bet.userYesVotes > bet.userNoVotes ? 'yes' : 'no'}
                  </div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Bet Amount</div>
                  <div className="font-semibold">{formatEther(((bet.userYesVotes) + (bet.userNoVotes)) as unknown as bigint)}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Potential Payout</div>
                  {/* <div className="font-semibold text-purple-400">${calculatePotentialPayout(formatEther(((betsByUser[0].userYesVotes) + (betsByUser[0].userNoVotes)) as unknown as bigint), parseInt(bet.yesPool), parseInt(bet.noPool))}</div> */}
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
                  href={`/prediction/${bet.id}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300"
                >
                  <span>View Prediction</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {showAiAnalysis[bet.id] && (
                <div className="mt-4 bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  {/* <p className="text-sm text-gray-300">{bet.aiAnalysis}</p> */}
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