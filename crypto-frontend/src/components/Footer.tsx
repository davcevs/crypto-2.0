const Footer = () => {
  return (
    <footer className="bg-black py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div className="text-gray-400">
            <h4 className="text-xl font-semibold">CryptoExchange</h4>
            <p className="mt-4">© 2024 All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
