import React, { useEffect, useState } from 'react';
import { TrendingUp, Plus, X, Filter, Search, Calendar, DollarSign, Users, Activity, CheckCircle2, Clock } from 'lucide-react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ABI, contractAddress } from '../utils/contractDetails';
import CreateQuestionButton from '../components/CreateQuestionButton';
import { formatEther } from 'viem';

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

function AdminDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    startDate: '',
    endDate: '',
    description: '',
    cryptoCurrency : '',
    targetPrice : '',
  });
  const {address} = useAccount();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const {data: questions} = useReadContract({
    address: contractAddress,
    abi: ABI,
    functionName: "getAllQuestions",
    args: [],
    account: address,
  })

  console.log(questions);

  useEffect(() => {
    if (questions) {
      setPredictions(questions as unknown as Prediction[]);
    }
  }, [questions]);

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

  const getStatusIcon = (status: boolean) => {
    switch (status) {
      case true:
        return <Activity className="w-4 h-4" />;
      case false:
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle question creation logic here
    setShowCreateModal(false);
    setNewQuestion({
      question: '',
      startDate: '',
      endDate: '',
      description: '',
      cryptoCurrency : '',
      targetPrice  : ''
    });
  };

  
  const filteredPredictions = predictions.filter(prediction => {
    if (selectedFilter === 'all') return true;
    return prediction.isActive === true ? selectedFilter === 'active' : selectedFilter === 'resolved';
  });

  // console.log( ((questions as unknown as any[])[0].endTime).toString() )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Question
            </button>
          </div>
        </div>
      </div>

{/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Pool Value</p>
                <p className="text-2xl font-bold">{formatCurrency(24000)}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Questions</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => p.isActive === true).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Participants</p>
                <p className="text-2xl font-bold">144</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Resolved Questions</p>
                <p className="text-2xl font-bold">
                  {predictions.filter(p => p.isActive === false).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                className="bg-gray-800 rounded-lg pl-10 pr-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

{/* Questions Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6">Question</th>
                <th className="text-left py-4 px-6">End Date</th>
                <th className="text-left py-4 px-6">Status</th>
                <th className="text-left py-4 px-6">Pool Size</th>
                <th className="text-left py-4 px-6">Total Bets</th>
                <th className="text-left py-4 px-6">Resolution</th>
              </tr>
            </thead>
            <tbody>
              {(questions as unknown as Prediction[])?.map(prediction => (
                <tr key={prediction.id} className="border-b border-gray-700 hover:bg-gray-750">
                  <td className="py-4 px-6">{prediction.question}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span>{new Date(parseInt(prediction.endTime.toString()) * 969.9176).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-2 ${getStatusColor(prediction.isActive)}`}>
                      {getStatusIcon(prediction.isActive)}
                      <span className="capitalize">{prediction.isActive ? 'Active' : 'Resolved'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    $ {formatEther(parseInt(prediction.yesVotes.toString()) + parseInt(prediction.noVotes.toString()) as unknown as bigint)}
                  </td>
                  <td className="py-4 px-6">{formatEther(prediction.yesVotes as unknown as bigint)} / {formatEther(prediction.noVotes as unknown as bigint)}</td>
                  <td className="py-4 px-6">
                    {parseInt(prediction.yesVotes.toString()) > parseInt(prediction.noVotes.toString()) ? (
                      <span className={`capitalize ${(parseInt(prediction.yesVotes.toString()) > parseInt(prediction.noVotes.toString())) ? 'text-green-400' : 'text-red-400'}`}>
                        {parseInt(prediction.yesVotes.toString())}
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
{/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Create New Question</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateQuestion}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your question"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    CryptoCurrency
                  </label>
                  <input
                    type="text"
                    value={newQuestion.cryptoCurrency}
                    onChange={(e) => setNewQuestion({ ...newQuestion, cryptoCurrency: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your CryptoCurrency"
                    required
                  />
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    TargetPrice
                  </label>
                  <input
                    type="number"
                    value={newQuestion.targetPrice}
                    onChange={(e) => setNewQuestion({ ...newQuestion, targetPrice: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your targetPrice"
                    required
                  />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newQuestion.endDate}
                      onChange={(e) => setNewQuestion({ ...newQuestion, endDate: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    placeholder="Add additional context or rules"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-300"
                  >
                    Cancel
                  </button>
                  <CreateQuestionButton newQuestion = {newQuestion} setShowCreateModal = {setShowCreateModal}/>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;