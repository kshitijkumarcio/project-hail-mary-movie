import React from "react";
import ResultsContent from "@/components/sections/results-content";

export const metadata = {
  title: "Live Results - Project Hail Mary | Movie Night",
};

const LiveResultsPage = () => {
  return (
    <div className="bg-grid-dashed min-h-screen">
      <ResultsContent />
    </div>
  );
};

export default LiveResultsPage;
