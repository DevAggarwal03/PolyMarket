import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Brain , ArrowDownToLine } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import axios from "axios";

const Analysis = ({id,coin, target_price , date} : {coin : string , id : number , target_price : number , date : number}) => {
    const [showAiAnalysis, setShowAiAnalysis] = useState<Record<number, boolean>>({});

    const {address} = useAccount();

    const mapping = {
        'BTC' : 'bitcoin',
        'ETH' : 'ethereum',
        'SOL' : 'solana',
        'SEI' : 'sei'
    }

    const [probability , setProbability] = useState<null | number>(null);
    const [loading, setLoading] = useState<boolean>(false)

    const {data , isPending , isSuccess} = useReadContract({
        abi : ABI,
        address : contractAddress,
        functionName : "isSubscribed",
        account : address
    });

    const predictionByAI = async() => {
        setLoading(true)
        // @ts-ignore
        coin = mapping[coin.split('/')[0]]
        console.log(parseInt(String(target_price)));
        const res = await axios.get(`http://127.0.0.1:5000/predict?coin_id=${coin}&target_price=${target_price}&target_date=2025-03-01`)
        console.log(res.data.probability_score)
        setProbability(res.data.probability_score * 100);
        setLoading(false);
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
                {
                    loading ? (<p className="text-sm text-gray-300">loading</p>) : (<p className="text-sm text-gray-300">According to my analysis based on the past 60 days , probabilty of happening is : {probability}</p>)
                }
            </div>
        )}
    </div>
}

export default Analysis;