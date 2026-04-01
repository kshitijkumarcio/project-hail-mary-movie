import ATF from "@/components/sections/atf";
import Navbar from "@/components/sections/navbar";
import VotingForm from "@/components/sections/voting-form";

const HomePage = () => {
  return (
    <div className="no-scrollbar bg-dull-white">
      <ATF />
      <VotingForm />
    </div>
  );
};

export default HomePage;
