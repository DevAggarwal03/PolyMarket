import { TrendingUp, Wallet, ListFilter, Settings } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {}}>
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold text-white">PredictX</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {}}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4" />
                    Questions
                  </div>
                </button>

                <button
                  onClick={() => {}}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    My Bets
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <ConnectButton/>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-700">
        <div className="px-2 py-3 space-y-1">
          <button
            onClick={() => {}}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors `}
          >
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4" />
              Questions
            </div>
          </button>
          <button
            onClick={() => {}}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              My Bets
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;