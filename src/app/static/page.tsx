'use client';
import { useEffect, useState, Suspense } from 'react';
import NavBar from '../component/navbar'; // Importing the NavBar component

export default function StaticPage() {
  const [queryValue, setQueryValue] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [showResponse, setShowResponse] = useState(false); // State to manage response visibility

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    setQueryValue(urlParams.get('q') || ''); // Set query value from URL
  }, []);

  useEffect(() => {
    if (queryValue) {
      setLoading(true); // Set loading to true when the page starts loading
      const fetchData = async () => {
        let result = ''; // Initialize result variable
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: [{ role: 'user', content: queryValue }] }),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder('utf-8');
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              result += decoder.decode(value, { stream: true });
              setApiResponse(result);
            }
          } else {
            // If there's no reader, handle the response directly
            const data = await response.json();
            setApiResponse(data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false); // Set loading to false when fetching is done
          setShowResponse(true); // Show response after fetching is complete
        }
      };

      fetchData();
    }
  }, [queryValue]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
          <h1 className="text-3xl font-bold text-black mb-4">Your question is</h1>
          <p className="text-3xl text-black mb-4"><span className="font-semibold">{queryValue}</span></p>
          {loading && <h2 className="text-xl font-semibold mb-2 text-black">Please wait</h2>} {/* Show "Please wait" when loading */}
          {loading ? (
            <>
              <h2 className="text-xl font-semibold mb-2 text-black">Our bot is getting a reply to your question</h2>
              <div className="loader"></div> {/* Loading animation */}
            </>
          ) : null}
          {showResponse && (
            <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-2 text-black">{apiResponse}</h2>
              
            </div>
          )}
          <a href="/" className="text-blue-500 underline mt-4">Chat more with us here</a> {/* Hyperlink to root directory */}
        </div>
      </div>
      <style jsx>{`
        .loader {
          border: 8px solid #f3f3f3; /* Light grey */
          border-top: 8px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Suspense>
  );
}
