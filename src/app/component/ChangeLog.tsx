// components/ChangeLog.tsx
const ChangeLog = () => {
    const changeLog = {
      "24th Oct 2024": "Updated the AI to give card recommendations",
      "30th Oct 2024": "Updated the model to return MCCs for a given store"
    };
  
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <ol className="list-decimal pl-6 space-y-4">
          {Object.entries(changeLog)
            .reverse()
            .map(([date, item], index) => (
              <li key={index} className="text-lg">
                <span className="font-bold text-gray-700">{date}:</span>{" "}
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
        </ol>
      </div>
    );
  };
  
  export default ChangeLog;