"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const navigationLinks = [
  // { href: "/mcc-list", text: "Check MCCs" },
  // { href: "/faq", text: "FAQs" },
  // { href: "/changelog", text: "Updates" }
];

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-blue-100 shadow-sm relative">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-gray-800 hover:text-blue-600 transition duration-300 ease-in-out flex items-center gap-3"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Find Near Me
              </span>
              {/* <Image 
                src="/miles.png" 
                alt="Ask Miles Logo" 
                width={32} 
                height={32} 
                className="rounded-full shadow-sm hover:shadow-md transition-shadow duration-300"
              /> */}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navigationLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.text}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-blue-100 shadow-lg py-4 z-50">
            <div className="flex flex-col space-y-4 items-center">
              {navigationLinks.map((link) => (
                <NavLink key={link.href} href={link.href} mobile>
                  {link.text}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  newTab?: boolean;
  mobile?: boolean;
}

const NavLink = ({ href, children, newTab, mobile }: NavLinkProps) => (
  <Link 
    href={href} 
    className={`text-gray-600 hover:text-blue-600 font-medium transition duration-300 ease-in-out ${
      mobile ? 'w-full text-center' : ''
    }`}
    {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
  >
    {children}
  </Link>
);

export default NavBar;