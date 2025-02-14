import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import { formatEther, parseEther } from "viem";
import Analysis from "./Analysis";
import { Loader2 } from "lucide-react";

const BetCard = ({ prediction }: any) => {

    console.log(prediction)

    const [yesbets, setYesBets] = useState<number>(0);
    const [nobets, setNoBets] = useState<number>(0);

    const { writeContract, data: hash } = useWriteContract({});
    const { isLoading } = useWaitForTransactionReceipt({ hash })

    const noBetHandler = () => {
        if(nobets <= 0){
            console.log("Enter a amount greater than 0")
            return 
        }
        writeContract({
            abi: ABI,
            address: contractAddress,
            functionName: "vote",
            args: [parseInt(prediction.id),false],
            value : parseEther(String(nobets))
        })
    }

    const yesBetHandler = () => {
        if(yesbets <= 0) {
            console.log("Enter a amount greater than 0")
            return;
        }
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
                        {
                            isLoading ? (<div><Loader2/></div>) : (<div>Bet Yes</div>)
                        }
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
                        onChange={(e) => setNoBets(parseFloat(e.target.value))}
                    />
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors" onClick={() => noBetHandler()}>
                        {
                            isLoading ? (<div><Loader2/></div>) : (<div>Bet No</div>)
                        }
                    </button>
                </div>
            </div>
        </div>
        <Analysis id = {prediction.id} coin = {prediction.cryptoCurrency} date = {prediction.endTime} target_price = {prediction.targetPrice}/>
    </div>
}

export default BetCard;