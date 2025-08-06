import Header from "../../ui/Header";
import Feed from "../../ui/Feed";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-4 bg-brand-lightGray flex flex-col min-h-screen">
      <Header />
      <Feed />
      <Outlet /> 
    </div>
  );
};

export default Home;
