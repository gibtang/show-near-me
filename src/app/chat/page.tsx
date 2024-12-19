'use client';
import { useChat } from 'ai/react';
import { useState, useCallback, useEffect, useRef } from 'react';
import NavBar from '../component/navbar';
import Footer from '../component/footer';
import React from 'react';
import { NextSeo } from 'next-seo';
import Image from 'next/image';
import Cookies from 'js-cookie';

interface MessageResponse {
  message: string;
  sentiment_score: number;
  sentiment: string;
}

export default function Home() {
  const [waitingForAI, setWaitingForAI] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<string | undefined>();
  const [geoResponse, setGeoResponse] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debugCookie = Cookies.get('debug');
    setDebugMode(debugCookie);
  }, []);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch('/api/geo', {
          method: 'GET',
        });
        const data = await response.json();
        setGeoResponse(data.location.country);
      } catch (error) {
        console.error('Error fetching geo data:', error);
      }
    };

    fetchGeoData();
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: () => {
      setWaitingForAI(false);
      scrollToBottom();
    },
    body: {
      debug: debugMode,
    }
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmitWrapper = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      setWaitingForAI(true);
      handleSubmit(e);
    },
    [handleSubmit]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NextSeo
        title="Miles and Credit Card Chatbot"
        description="Ask me about your credit card and miles questions"
      />
      <NavBar />
      <main className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Find Near Me
              {geoResponse && <span>{geoResponse}</span>}
            </h1>
            <div className="text-lg text-gray-700 max-w-2xl mx-auto">
              Just key in what you want to discover and we will surface places for you within 2 kilometers
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
          <div className="chat-box h-[50vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-blue-50/50 to-white">
            {waitingForAI && (
              <div className="flex justify-center items-center h-16">
                <Image src='/1484.gif' alt="Loading..." width={48} height={48} className="opacity-80" />
              </div>
            )}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-gray-500">
              </div>
            )}
            {messages.map((m, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : 'bg-white border border-blue-100 shadow-sm'
                } max-w-[80%] flex items-start animate-fade-in`}
              >
                {m.role !== 'user' && (
                  <Image 
                    src="/miles.png" 
                    alt="AI Buddy" 
                    width={32} 
                    height={32} 
                    className="mr-3 rounded-full shadow-sm" 
                  />
                )}
                <div>
                  <span className="font-medium">{m.role === 'user' ? 'You' : 'AI Buddy'}:</span>{' '}
                  {(() => {
                    try {
                      const parsedContent: MessageResponse = JSON.parse(m.content);
                      const message = parsedContent.message;

                      // Check if the message contains HTML tags
                      // let hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(message);
                      // if (hasHtmlTags) {
                      return <div dangerouslySetInnerHTML={{ __html: message }} />;
                      // }
                      // return message;
                    } catch (e) {
                      return m.content.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          <div dangerouslySetInnerHTML={{ __html: line }} />
                          {i < m.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ));
                    }
                  })()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-blue-100">
            <form onSubmit={handleSubmitWrapper} className="flex space-x-3">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="What cafes are near by?"
                className="flex-grow px-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-700 placeholder-gray-400"
                disabled={waitingForAI}
              />
              <button
                type="submit"
                className={`px-6 py-3 text-white rounded-xl transition duration-300 ease-in-out ${
                  waitingForAI
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                }`}
                disabled={waitingForAI}
              >
                Ask
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
