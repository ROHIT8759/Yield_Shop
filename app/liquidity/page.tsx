'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Droplet, Plus, Minus, TrendingUp, DollarSign, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Demo Mode - Realistic simulation with mock data
export default function LiquidityPoolPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [mntAmount, setMntAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'add' | 'remove'>('add');

  // Demo state
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLPTokens, setUserLPTokens] = useState(25.5);
  const [userMNTDeposited, setUserMNTDeposited] = useState(150);
  const [userUSDCDeposited, setUserUSDCDeposited] = useState(150);
  const [userRewards, setUserRewards] = useState(12.45);

  // Pool stats (realistic demo values)
  const poolStats = {
    totalMNT: 15420.5,
    totalUSDC: 15890.25,
    totalLP: 2547.8,
    feesCollected: 1247.65,
    shoppingVolume: 415885,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const simulateTransaction = (successMessage: string, callback?: () => void) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(successMessage);
      if (callback) callback();
    }, 2000);
  };

  const handleAddLiquidity = async () => {
    if (!mntAmount || !usdcAmount) {
      alert('Please enter both MNT and USDC amounts');
      return;
    }

    const mnt = parseFloat(mntAmount);
    const usdc = parseFloat(usdcAmount);

    if (isNaN(mnt) || isNaN(usdc) || mnt <= 0 || usdc <= 0) {
      alert('Please enter valid amounts');
      return;
    }

    simulateTransaction('✅ Liquidity added successfully! You received LP tokens.', () => {
      const newLPTokens = Math.sqrt(mnt * usdc);
      setUserLPTokens(prev => prev + newLPTokens);
      setUserMNTDeposited(prev => prev + mnt);
      setUserUSDCDeposited(prev => prev + usdc);
      setMntAmount('');
      setUsdcAmount('');
    });
  };

  const handleRemoveLiquidity = async () => {
    if (!removeAmount) {
      alert('Please enter LP token amount to remove');
      return;
    }

    const lpAmount = parseFloat(removeAmount);

    if (isNaN(lpAmount) || lpAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (lpAmount > userLPTokens) {
      alert('Insufficient LP tokens');
      return;
    }

    simulateTransaction('✅ Liquidity removed successfully! Tokens returned to your wallet.', () => {
      const ratio = lpAmount / userLPTokens;
      setUserLPTokens(prev => prev - lpAmount);
      setUserMNTDeposited(prev => prev * (1 - ratio));
      setUserUSDCDeposited(prev => prev * (1 - ratio));
      setRemoveAmount('');
    });
  };

  const handleClaimRewards = async () => {
    if (userRewards <= 0) {
      alert('No rewards available to claim');
      return;
    }

    simulateTransaction(`✅ Claimed $${userRewards.toFixed(2)} USDC in rewards!`, () => {
      setUserRewards(0);
    });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Droplet className="h-12 w-12 text-blue-500 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Liquidity Pool</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Provide liquidity and earn 0.3% fees from every shopping transaction
          </p>
        </div>

        {/* Demo Badge */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-8">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <span className="text-gray-300 font-semibold">Demo Mode - Realistic Simulation</span>
            <CheckCircle className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        {!mounted || !isConnected ? (
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center max-w-md mx-auto">
            <Wallet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-gray-500">Connect to provide liquidity and earn rewards</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pool Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-blue-500/50 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total MNT Liquidity</span>
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {poolStats.totalMNT.toLocaleString()} MNT
                </div>
                <div className="text-xs text-gray-600 mt-1">≈ ${(poolStats.totalMNT * 0.65).toLocaleString()}</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-green-500/50 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total USDC Liquidity</span>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {poolStats.totalUSDC.toLocaleString()} USDC
                </div>
                <div className="text-xs text-gray-600 mt-1">≈ ${poolStats.totalUSDC.toLocaleString()}</div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-blue-500/50 hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Fees Collected</span>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  ${poolStats.feesCollected.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 mt-1">From ${poolStats.shoppingVolume.toLocaleString()} volume</div>
              </div>
            </div>

            {/* APY Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm mb-1">Current APY</div>
                  <div className="text-4xl font-bold text-green-500">8.45%</div>
                  <div className="text-sm text-gray-600 mt-1">Based on last 7 days fee volume</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-sm mb-1">Total Liquidity</div>
                  <div className="text-2xl font-bold text-white">${(poolStats.totalMNT * 0.65 + poolStats.totalUSDC).toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">{poolStats.totalLP.toFixed(2)} LP Tokens</div>
                </div>
              </div>
            </div>

            {/* User Stats */}
            {userLPTokens > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-500" />
                  Your Liquidity Position
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-500 text-sm mb-1">MNT Deposited</div>
                    <div className="text-white font-semibold">{userMNTDeposited.toFixed(2)} MNT</div>
                    <div className="text-xs text-gray-600">≈ ${(userMNTDeposited * 0.65).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">USDC Deposited</div>
                    <div className="text-white font-semibold">{userUSDCDeposited.toFixed(2)} USDC</div>
                    <div className="text-xs text-gray-600">≈ ${userUSDCDeposited.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">LP Tokens</div>
                    <div className="text-white font-semibold">{userLPTokens.toFixed(4)}</div>
                    <div className="text-xs text-gray-600">{((userLPTokens / poolStats.totalLP) * 100).toFixed(2)}% of pool</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm mb-1">Rewards Earned</div>
                    <div className="text-green-500 font-semibold">${userRewards.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">Ready to claim</div>
                  </div>
                </div>
                <button
                  onClick={handleClaimRewards}
                  disabled={isProcessing || userRewards === 0}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5" />
                      Claim ${userRewards.toFixed(2)} USDC
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Add/Remove Liquidity */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl">
              {/* Tabs */}
              <div className="flex space-x-4 mb-6 border-b border-zinc-800">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`pb-3 px-4 font-semibold transition-colors ${activeTab === 'add'
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-white'
                    }`}
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  Add Liquidity
                </button>
                <button
                  onClick={() => setActiveTab('remove')}
                  className={`pb-3 px-4 font-semibold transition-colors ${activeTab === 'remove'
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-500 hover:text-white'
                    }`}
                >
                  <Minus className="h-5 w-5 inline mr-2" />
                  Remove Liquidity
                </button>
              </div>

              {/* Add Liquidity Form */}
              {activeTab === 'add' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">MNT Amount</label>
                    <input
                      type="number"
                      value={mntAmount}
                      onChange={(e) => setMntAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-black text-white px-4 py-3 rounded-lg border border-zinc-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">USDC Amount</label>
                    <input
                      type="number"
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-black text-white px-4 py-3 rounded-lg border border-zinc-800 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddLiquidity}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Add Liquidity
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Remove Liquidity Form */}
              {activeTab === 'remove' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2 text-sm">LP Token Amount</label>
                    <input
                      type="number"
                      value={removeAmount}
                      onChange={(e) => setRemoveAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-black text-white px-4 py-3 rounded-lg border border-zinc-800 focus:border-red-500 focus:outline-none"
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      Available: {userLPTokens.toFixed(4)} LP tokens
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveLiquidity}
                    disabled={isProcessing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <Minus className="h-5 w-5" />
                        Remove Liquidity
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">How It Works</h3>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Deposit MNT + USDC to the pool</li>
                  <li>• Receive LP tokens (your share)</li>
                  <li>• Earn 0.3% fee from shopping</li>
                  <li>• Withdraw anytime with rewards</li>
                </ul>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-white">Benefits</h3>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>✓ Earn passive income (8-12% APY)</li>
                  <li>✓ Proportional fee distribution</li>
                  <li>✓ No impermanent loss risk</li>
                  <li>✓ Support YieldShop growth</li>
                </ul>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-white">Revenue Model</h3>
                </div>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• 0.3% fee per transaction</li>
                  <li>• ${poolStats.shoppingVolume.toLocaleString()} total volume</li>
                  <li>• ${poolStats.feesCollected.toLocaleString()} fees collected</li>
                  <li>• Growing daily with platform</li>
                </ul>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Recent Pool Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-sm">User added liquidity</span>
                  </div>
                  <span className="text-gray-600 text-sm">2 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Shopping payment processed</span>
                  </div>
                  <span className="text-gray-600 text-sm">5 min ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-400 text-sm">Rewards claimed</span>
                  </div>
                  <span className="text-gray-600 text-sm">12 min ago</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
