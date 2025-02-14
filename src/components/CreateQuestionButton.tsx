import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { ABI, contractAddress } from "../utils/contractDetails";
import { Loader2 } from "lucide-react";

const CreateQuestionButton = ({newQuestion , setShowCreateModal} : any) => {

    console.log(newQuestion);

    const { data: hash, isPending, writeContract } = useWriteContract({});
    const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash });

    const createQuestionHandler = () => {
        const date = new Date(newQuestion.endDate);
        const unixTime = Math.floor(date.getTime() / 1000)
        console.log(unixTime)
        writeContract({
            abi: ABI,
            address: contractAddress,
            functionName: "createQuestion",
            args: [newQuestion.question, newQuestion.description, unixTime, newQuestion.cryptoCurrency, newQuestion.targetPrice]
        })
    }

    if(isSuccess && !isLoading && !isPending && hash){
        setShowCreateModal(false);
        return;
    }

    if(isLoading || isPending){
        return <div className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex justify-center items-center">
            <Loader2/>
        </div>
    }
    else{
        return <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
        onClick={() => createQuestionHandler()}
    >
        Create Question
    </button>
    }
}

export default CreateQuestionButton;