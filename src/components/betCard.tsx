import { Brain, ArrowDownToLine, AlertCircle } from "lucide-react"
import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import { formatEther, parseEther } from "viem";

const BetCard = ({ prediction }: any) => {

    console.log(prediction)

    const [yesbets, setYesBets] = useState<number>(0);
    const [nobets, setNoBets] = useState<number>(0);
    const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});

    const { writeContract, isPending, data: hash } = useWriteContract({});
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

    // const handleBetChange = (predictionId: number, type: 'yes' | 'no', value: string) => {
    //     setBets(prev => ({
    //         ...prev,
    //         [predictionId]: {
    //             ...(prev[predictionId] || { yes: '', no: '' }),
    //             [type]: value
    //         }
    //     }));
    // };

    const toggleAiAnalysis = (predictionId: number) => {
        setShowAiAnalysis(prev => ({
            ...prev,
            [predictionId]: !prev[predictionId]
        }));
    };

    const noBetHandler = () => {
        if(nobets <= 0){
            console.log("amount should atleast be one")
            return 
        }
        writeContract({
            abi: ABI,
            address: contractAddress,
            functionName: "",
            args: [parseInt(prediction.id),false],
            value : parseEther(String(nobets))
        })
    }

    const yesBetHandler = () => {
        // if(yesbets <= 0){
        //     console.log("amount should atleast be one")
        //     return 
        // }
        console.log("hi there ")
        writeContract({
            abi: ABI,
            address: contractAddress,
            functionName: "vote",
            args: [parseInt(prediction.id),true],
            value : parseEther(String(yesbets))
        })
    }


    return <div>
        <h2 className="text-xl font-semibold">{prediction.question}</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Yes Pool: ${Number(formatEther(prediction.yesVotes)).toFixed(2)}</span>
                    <span className="text-green-400">Odds: {((parseInt(prediction.yesVotes.toString()) / (parseInt(prediction.yesVotes.toString()) + parseInt(prediction.noVotes.toString()))) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Bet amount for Yes"
                        className="flex-1 bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={yesbets}
                        onChange={(e) => setYesBets(parseFloat(e.target.value))}
                    />
                    <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors" onClick={() => yesBetHandler()}>
                        Bet Yes
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>No Pool: ${Number(formatEther(prediction.noVotes)).toFixed(2)}</span>
                    <span className="text-red-400">Odds: {((parseFloat(prediction.noVotes.toString()) / (parseInt(prediction.yesVotes.toString()) + parseInt(prediction.noVotes.toString()))) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Bet amount for No"
                        className="flex-1 bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={nobets}
                        onChange={(e) => setNoBets(parseInt(e.target.value))}
                    />
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors" onClick={() => noBetHandler()}>
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
}

export default BetCard;