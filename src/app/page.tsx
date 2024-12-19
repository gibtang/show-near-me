// app/page.tsx
"use client";
import { MessageCircle, CreditCard, Plane, ArrowRight, Star, Shield } from 'lucide-react';
import Image from 'next/image';
import NavBar from './component/navbar'

const NavLink: React.FC<{ href: string; children: React.ReactNode; newTab?: boolean }> = ({ href, children, newTab }) => (
  <a 
    href={href} 
    className="text-gray-600 hover:text-blue-600 font-medium transition duration-300 ease-in-out"
    {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
  >
    {children}
  </a>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <NavBar />
      {/* Navigation */}

      {/* Hero */}
      <header className="relative px-4 py-16 text-center">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-radial from-blue-100/50 to-transparent opacity-50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl animate-fade-in">
          <Image 
            src="/miles.png"
            alt=""
            width={64}
            height={64}
            className="mx-auto mb-6 w-16 h-16 rounded-full shadow-lg"
          />
          <h1 className="mb-4 text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Ask Miles About Your Travel Rewards
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Your AI assistant for maximizing credit card miles and travel rewards
          </p>
          <a
            href="/chat"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
          >
            Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-3">
          <div className="animate-fade-in rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <CreditCard className="mx-auto h-20 w-20 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Smart Card Suggestions</h3>
            <p className="text-gray-600">Get personalized recommendations based on your travel goals</p>
          </div>

          <div className="animate-fade-in rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: '0.1s' }}>
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <Plane className="mx-auto h-20 w-20 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Miles Expert</h3>
            <p className="text-gray-600">Learn the best strategies to earn and redeem your travel miles</p>
          </div>

          <div className="animate-fade-in rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300" style={{ animationDelay: '0.2s' }}>
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <Star className="mx-auto h-20 w-20 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">24/7 Guidance</h3>
            <p className="text-gray-600">Get instant answers to all your rewards questions, anytime</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-blue-600 py-16 text-white">
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-radial from-blue-500 to-blue-600 opacity-50" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold">Ready to Maximize Your Miles?</h2>
          <p className="mb-8 text-xl opacity-90">Join thousands of travelers getting more from their rewards</p>
          <a
            href="/chat"
            className="rounded-lg bg-white px-6 py-3 text-lg font-medium text-blue-600 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-300"
          >
            Try Ask Miles Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-gray-600">
        <div className="mb-4 flex items-center justify-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Your data is always secure and private</span>
        </div>
        <p></p>
      </footer>
    </div>
  );
}