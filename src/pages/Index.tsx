import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAppContext } from "../context/AppContext";
import Login from "./Login";
import Orders from "./Orders"; // We will create this next

const Index = () => {
  const { currentWaiter } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {currentWaiter ? <Orders /> : <Login />}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;