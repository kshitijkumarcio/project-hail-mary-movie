import ATF from "@/components/sections/atf";
import Navbar from "@/components/sections/navbar";
import VotingForm from "@/components/sections/voting-form";

const HomePage = () => {
  return (
    <div className="no-scrollbar min-h-[400svh] bg-dull-white">
      <ATF />
      <VotingForm />
    </div>
  );
};

export default HomePage;
