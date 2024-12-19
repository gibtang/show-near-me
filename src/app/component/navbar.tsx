import React from 'react';
import { Compass } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <Compass className="w-8 h-8 text-blue-600" />
        <span className="text-xl font-bold text-gray-800">LocalBuddy</span>
      </div>
      <div className="flex items-center space-x-6">
        {/* <a href="#" className="text-gray-600 hover:text-blue-600">How it Works</a>
        <a href="#" className="text-gray-600 hover:text-blue-600">Pricing</a>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Get Started
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;
