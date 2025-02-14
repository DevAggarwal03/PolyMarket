import React from 'react';
import { TrendingUp, ArrowDownToLine, Clock } from 'lucide-react';
import { Abi, formatEther, parseEther } from 'viem';
import Analysis from '../components/Analysis';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { contractAddress, ABI } from '../utils/contractDetails';

export interface Bet {
  id: number;
  question: string;
  description: string;
  endTime: number;
  isActive: boolean;
  cryptoCurrency: string;
  targetPrice: number;
  yesVotes: number;
  noVotes: number;
  userYesVotes: number;
  userNoVotes: number;
}

function MyBets({betsByUser}: {betsByUser: Bet[]}) {
  // const {address} = useAccount();
  const [withdrawalAmounts, setWithdrawalAmounts] = React.useState<{withdrawalAmount: string, betId: number, vote: boolean}>({withdrawalAmount: "", betId: 0, vote: true});
  const {writeContract, data: hash} = useWriteContract();
  // const {address} = useAccount();
  const {} = useWaitForTransactionReceipt({hash});
  console.log(betsByUser);

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

  const handleWithdrawalAmountChange = (e: React.ChangeEvent<HTMLInputElement>, betId: number) => {
    setWithdrawalAmounts(prev => ({
      ...prev,
      withdrawalAmount: e.target.value,
      betId: betId
    }));
  }

  const handleWithdrawalVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWithdrawalAmounts(prev => ({
      ...prev,
      vote: e.target.value === "yes" ? true : false
    }));
  }

  const withdrawBet = () => {
    console.log(withdrawalAmounts);
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: ABI as Abi,
      functionName: "withdrawBets",
      args: [parseInt(withdrawalAmounts.betId.toString()), parseEther(withdrawalAmounts.withdrawalAmount), withdrawalAmounts.vote]
    })
  }

  const calculatePotentialPayout = (totalYes: number, totalNo: number, userYesTokens : number , userNoTokens : number) => {

    console.log(totalNo)
    console.log(totalYes)

    const yesTokenValue = totalYes / (totalYes + totalNo);
    const noTokenValue = totalNo / (totalYes + totalNo);

    const payout = (userYesTokens * yesTokenValue) + (userNoTokens * noTokenValue);
    return (payout / (10 ** 18)).toPrecision(2);
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
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={withdrawalAmounts.withdrawalAmount}
                    onChange={(e) => handleWithdrawalAmountChange(e, bet.id)}
                    className="w-24 px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 text-white"
                    placeholder="Amount"
                  />
                  <input
                    type="text"
                    value={withdrawalAmounts.vote ? "yes" : "no"}
                    onChange={(e) => handleWithdrawalVoteChange(e)}
                    className="w-24 px-2 py-1 text-sm bg-gray-700 rounded border border-gray-600 text-white"
                    placeholder="yes/no"
                  />
                  <button 
                    onClick={withdrawBet} 
                    className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    Withdraw Bet
                  </button>
                </div>
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
                  <div className="font-semibold text-purple-400">${calculatePotentialPayout(parseInt(String(bet.yesVotes)), parseInt(String(bet.noVotes)),parseInt(String(bet.userYesVotes)),parseInt(String(bet.userNoVotes)))}</div>
                </div>
              </div>
              <Analysis id = {bet.id} target_price={bet.targetPrice} coin={bet.cryptoCurrency} date={bet.endTime}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBets;