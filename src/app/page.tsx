"use client"
import React from 'react';
import { Globe, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Updated import
import Navbar from './component/navbar'; // Using a relative path from the src directory

const Homepage = () => {
  const router = useRouter();

  const handleTryItForFree = () => {
    router.push('/chat');
  };

  const handleGetStarted = () => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <Navbar /> {/* Using the Navbar component */}

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Hey there! Let&apos;s explore your neighborhood together
            </h1>
            <p className="text-xl text-gray-600">
              Just like a friendly local guide, I&apos;ll help you discover amazing places nearby. 
              Whether you&apos;re craving the best coffee, searching for a cozy bookstore, or 
              looking for a hidden gem restaurant.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleTryItForFree} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                Try it for free <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <label htmlFor="search" className="sr-only">What are you looking for?</label>
                <input 
                  id="search"
                  type="text"
                  placeholder="What are you looking for?"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-700">🎨 "Where can I find art galleries near me?"</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-gray-700">🌿 Finding 3 art galleries within 1 mile...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <Globe className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Local Knowledge</h3>
            <p className="text-gray-600">
              Get personalized recommendations based on real-time location data and local insights.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
            <p className="text-gray-600">
              Chat naturally about what you&apos;re looking for, just like asking a friend for recommendations.
            </p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <MapPin className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Get up-to-date information about opening hours, current events, and local happenings.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Join thousands of happy explorers</h2>
            <p className="text-gray-600">Here&apos;s what people are saying about their LocalBuddy experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-4">
                &quot;It&apos;s like having a knowledgeable friend in every city! Found the most amazing local 
                coffee shop I would have never discovered otherwise.&quot;
              </p>
              <p className="font-semibold">Sarah M.</p>
              <p className="text-sm text-gray-500">Digital Nomad</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-4">
                &quot;Perfect for when you&apos;re in a new neighborhood and want to find those hidden gems 
                that locals love!&quot;
              </p>
              <p className="font-semibold">James L.</p>
              <p className="text-sm text-gray-500">Food Enthusiast</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-4">
                &quot;The recommendations are spot-on and it feels like chatting with a friend who 
                really knows the area.&quot;
              </p>
              <p className="font-semibold">Maya K.</p>
              <p className="text-sm text-gray-500">Local Explorer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
