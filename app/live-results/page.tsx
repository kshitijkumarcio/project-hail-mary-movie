import React from "react";

export const metadata = {
  title: "Live Results - Project Hail Mary | Movie Night",
};

const LiveResultsPage = () => {
  return (
    <div className="min-h-screen bg-dull-white flex flex-col items-center justify-center p-10">
      <h1 className="text-4xl font-mona-sans font-bold text-black mb-4">
        Live Results
      </h1>
      <p className="text-black/60 font-mona-sans text-lg">
        Voting results will be displayed here soon!
      </p>
    </div>
  );
};

export default LiveResultsPage;
