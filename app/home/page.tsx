import ATF from "@/components/sections/atf";
import Footer from "@/components/sections/footer";
import Instructions from "@/components/sections/instructions";
import Navbar from "@/components/sections/navbar";
import VotingForm from "@/components/sections/voting-form";

const HomePage = () => {
  return (
    <div className="no-scrollbar bg-dull-white">
      <ATF />
      <Instructions />
      <VotingForm />
      <Footer />
    </div>
  );
};

export default HomePage;
