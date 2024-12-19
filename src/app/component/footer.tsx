const Footer: React.FC = () => {
    return (
      <footer className="py-6 mt-auto bg-gradient-to-b from-blue-50 to-white text-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center space-x-4 text-sm">
          </div>
          <div className="mt-2 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    );
};

export default Footer;
