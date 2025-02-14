import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Brain , ArrowDownToLine } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import axios from "axios";

const Analysis = ({id,coin, target_price , date} : any) => {
    const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});

    const {address} = useAccount();

    const {data , isPending , isSuccess} = useReadContract({
        abi : ABI,
        address : contractAddress,
        functionName : "isSubscribed",
        account : address
    });

    const predictionByAI = async() => {
        const res = await axios.get(`http://127.0.0.1:5000/predict?coin_id=${coin}&target_price=${target_price}&target_date=${date}`)
        console.log(res.data)
    }

    const toggleAiAnalysis = async(predictionId: number) => {

        if(showAiAnalysis){
            await predictionByAI();
        }
        setShowAiAnalysis(prev => ({
            ...prev,
            [predictionId]: !prev[predictionId]
        }));
    };

    return <div className="w-full">
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            {
                (!isPending && isSuccess && data === true) ? ( <button
                    className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
                    onClick={() => toggleAiAnalysis(id)}
                >
                    <Brain className="w-4 h-4" />
                    {showAiAnalysis[id] ? 'Hide AI Analysis' : 'Show AI Analysis'}
                </button>) : (<div></div>)
            }

            <button className="flex items-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">
                <ArrowDownToLine className="w-4 h-4" />
                Withdraw Bet
            </button>
        </div>

        {showAiAnalysis[id] && (
            <div className="mt-4 bg-gray-700 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <p className="text-sm text-gray-300">ai analysis</p>
            </div>
        )}
    </div>
}

export default Analysis;