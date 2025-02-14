import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount} from "wagmi";
import Questions from "./userHome";

const Home = () => {


    const { address } = useAccount();

    if(address !== undefined){
        return <Questions/>
    }

    else{
        return (
            <div className="flex w-screen h-screen justify-center items-center bg-black">
                <ConnectButton />
            </div>
        );
    }
}

export default Home;