import { BellRing } from "lucide-react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import { parseEther } from "viem";
import { Loader2 } from "lucide-react";

const SubscribeButton = () => {

    const { writeContract , data : hash, isPending} = useWriteContract({})
    const { isSuccess } = useWaitForTransactionReceipt({ hash });

    const subscribeHandler = async () => {
        writeContract({
            abi: ABI,
            address: contractAddress,
            functionName: "subscribeAgent",
            value: parseEther("0.1")
        })
    }

    if (isPending) {
        return <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors" onClick={() => subscribeHandler()}>
            <Loader2/>
        </button>
    }
    if (!isPending) {
        return <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors" onClick={() => subscribeHandler()}>
            <BellRing className="w-5 h-5" />
            Subscribe to AI Agent
        </button>
    }
    if(!isPending && isSuccess){
        return <div className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors'>Agent In Use</div>
    }
}

export default SubscribeButton;