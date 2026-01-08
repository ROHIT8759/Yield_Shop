'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Activity, ArrowDownUp, Loader2 } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CONTRACTS } from '@/config/contracts';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
  high_24h: number;
  low_24h: number;
}

interface ChartDataPoint {
  index: number;
  price: number;
}

// ERC20 ABI for token operations
const ERC20_ABI = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Liquidity Pool ABI for swaps
const LIQUIDITY_POOL_ABI = [
  {
    inputs: [
      { name: 'buyer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'paymentToken', type: 'address' }
    ],
    name: 'processShoppingPayment',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPoolStats',
    outputs: [
      { name: 'mntLiquidity', type: 'uint256' },
      { name: 'usdcLiquidity', type: 'uint256' },
      { name: 'lpSupply', type: 'uint256' },
      { name: 'feesCollected', type: 'uint256' },
      { name: 'shoppingVolume', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export default function TradingPage() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Trading state
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Get MNT and USDC balances
  const { data: mntBalance } = useBalance({
    address: address,
    token: CONTRACTS.MNT,
  });

  const { data: usdcBalance } = useBalance({
    address: address,
    token: CONTRACTS.USDC,
  });

  // Contract interactions
  const { writeContract: approveMNT, data: approveMNTHash } = useWriteContract();
  const { writeContract: approveUSDC, data: approveUSDCHash } = useWriteContract();
  const { writeContract: executeSwap, data: swapHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveMNTHash || approveUSDCHash });
  const { isLoading: isSwapping } = useWaitForTransactionReceipt({ hash: swapHash });

  // Get pool stats
  const { data: poolStats, refetch: refetchPoolStats } = useReadContract({
    address: CONTRACTS.LIQUIDITY_POOL,
    abi: LIQUIDITY_POOL_ABI,
    functionName: 'getPoolStats',
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch top crypto prices from CoinGecko
  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: true,
            price_change_percentage: '24h'
          }
        }
      );
      setCryptos(response.data);
      if (response.data.length > 0) {
        setSelectedCrypto(response.data[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  // Fetch detailed chart data for selected crypto
  const fetchChartData = async (coinId: string) => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: 7
          }
        }
      );
      const formattedData = response.data.prices.map((price: [number, number]) => ({
        time: new Date(price[0]).toLocaleDateString(),
        price: price[1]
      }));
      setChartData(formattedData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCrypto) {
      fetchChartData(selectedCrypto.id);
    }
  }, [selectedCrypto]);

  // Handle token swap
  const handleSwap = async () => {
    if (!tradeAmount || !address) {
      alert('Please enter an amount');
      return;
    }

    try {
      const amount = parseEther(tradeAmount);
      const tokenAddress = tradeType === 'buy' ? CONTRACTS.USDC : CONTRACTS.MNT;

      // Step 1: Approve token
      if (tradeType === 'buy') {
        approveUSDC({
          address: CONTRACTS.USDC,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.LIQUIDITY_POOL, amount],
        });
      } else {
        approveMNT({
          address: CONTRACTS.MNT,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.LIQUIDITY_POOL, amount],
        });
      }

      // Step 2: Execute swap (after approval)
      setTimeout(() => {
        executeSwap({
          address: CONTRACTS.LIQUIDITY_POOL,
          abi: LIQUIDITY_POOL_ABI,
          functionName: 'processShoppingPayment',
          args: [address, amount, tokenAddress],
        });
      }, 3000);

      setTimeout(() => {
        alert('Swap completed successfully!');
        setTradeAmount('');
        setShowTradeModal(false);
        refetchPoolStats();
      }, 6000);

    } catch (error) {
      console.error('Swap error:', error);
      alert('Swap failed. Please try again.');
    }
  };

  const openTradeModal = (type: 'buy' | 'sell', crypto: CryptoData) => {
    setTradeType(type);
    setSelectedCrypto(crypto);
    setShowTradeModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 text-glow">
                Crypto Trading
              </h1>
              <p className="text-gray-400">Live prices and charts for top cryptocurrencies</p>
            </div>
            <button
              onClick={fetchCryptoData}
              className="bg-sol-primary hover:bg-sol-primary/80 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh Prices
            </button>
          </div>

          {!mounted || !isConnected ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Activity className="h-16 w-16 text-sol-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
              <p className="text-gray-400">Connect your wallet to start trading cryptocurrencies</p>
            </div>
          ) : loading ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sol-primary mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading market data...</p>
            </div>
          ) : (
            <>
              {/* Selected Crypto Details */}
              {selectedCrypto && (
                <div className="glass-card rounded-xl p-6 mb-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedCrypto.image}
                        alt={selectedCrypto.name}
                        className="h-12 w-12"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedCrypto.name}</h2>
                        <p className="text-gray-400 uppercase">{selectedCrypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">
                        ${selectedCrypto.current_price.toLocaleString()}
                      </p>
                      <div className={`flex items-center gap-1 justify-end mt-1 ${selectedCrypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {selectedCrypto.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {Math.abs(selectedCrypto.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Chart */}
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                          dataKey="time"
                          stroke="#888"
                          tick={{ fill: '#888' }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: '#888' }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#09090b',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                      <p className="text-white font-semibold">
                        ${(selectedCrypto.market_cap / 1e9).toFixed(2)}B
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                      <p className="text-white font-semibold">
                        ${(selectedCrypto.total_volume / 1e9).toFixed(2)}B
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">24h High</p>
                      <p className="text-green-400 font-semibold">
                        ${selectedCrypto.high_24h.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">24h Low</p>
                      <p className="text-red-400 font-semibold">
                        ${selectedCrypto.low_24h.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Trade Buttons */}
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => openTradeModal('buy', selectedCrypto)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      disabled={!isConnected}
                    >
                      Buy {selectedCrypto.symbol.toUpperCase()}
                    </button>
                    <button
                      onClick={() => openTradeModal('sell', selectedCrypto)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      disabled={!isConnected}
                    >
                      Sell {selectedCrypto.symbol.toUpperCase()}
                    </button>
                  </div>
                </div>
              )}

              {/* Crypto List */}
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sol-primary/30 bg-sol-primary/10">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">#</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Coin</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Price</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">24h Change</th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Market Cap</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">7d Chart</th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cryptos.map((crypto, index) => (
                        <tr
                          key={crypto.id}
                          className={`border-b border-sol-primary/10 hover:bg-sol-primary/5 transition-colors cursor-pointer ${selectedCrypto?.id === crypto.id ? 'bg-sol-primary/10' : ''
                            }`}
                          onClick={() => setSelectedCrypto(crypto)}
                        >
                          <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={crypto.image} alt={crypto.name} className="h-8 w-8" />
                              <div>
                                <p className="text-white font-medium">{crypto.name}</p>
                                <p className="text-gray-400 text-sm uppercase">{crypto.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-white font-medium">
                            ${crypto.current_price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`flex items-center justify-end gap-1 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                              {crypto.price_change_percentage_24h >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-white">
                            ${(crypto.market_cap / 1e9).toFixed(2)}B
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-12 w-24 mx-auto">
                              <MiniChart
                                data={crypto.sparkline_in_7d.price}
                                positive={crypto.price_change_percentage_24h >= 0}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="bg-sol-primary hover:bg-sol-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTradeModal('buy', crypto);
                              }}
                            >
                              Trade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trade Modal */}
              {showTradeModal && selectedCrypto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                  <div className="glass-card rounded-xl p-8 max-w-md w-full">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto.symbol.toUpperCase()}
                      </h2>
                      <button
                        onClick={() => setShowTradeModal(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <img src={selectedCrypto.image} alt={selectedCrypto.name} className="h-10 w-10" />
                        <div>
                          <p className="text-white font-semibold">{selectedCrypto.name}</p>
                          <p className="text-gray-400 text-sm">
                            ${selectedCrypto.current_price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Amount ({tradeType === 'buy' ? 'USDC' : 'MNT'})</label>
                        <input
                          type="number"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-sol-primary focus:outline-none"
                        />
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <span className="text-gray-400">Balance:</span>
                          <span className="text-white">
                            {tradeType === 'buy'
                              ? `${usdcBalance ? formatEther(usdcBalance.value) : '0'} USDC`
                              : `${mntBalance ? formatEther(mntBalance.value) : '0'} MNT`}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">You {tradeType === 'buy' ? 'pay' : 'receive'}:</span>
                          <span className="text-white font-semibold">
                            {tradeAmount || '0'} {tradeType === 'buy' ? 'USDC' : 'MNT'}
                          </span>
                        </div>
                        <div className="flex justify-center my-2">
                          <ArrowDownUp className="h-5 w-5 text-sol-primary" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">You {tradeType === 'buy' ? 'receive' : 'pay'}:</span>
                          <span className="text-white font-semibold">
                            ~{tradeAmount ? (parseFloat(tradeAmount) * 0.997).toFixed(4) : '0'} {tradeType === 'buy' ? 'MNT' : 'USDC'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Fee: 0.3%</p>
                      </div>
                    </div>

                    <button
                      onClick={handleSwap}
                      disabled={!tradeAmount || isApproving || isSwapping}
                      className="w-full bg-sol-primary hover:bg-sol-primary/80 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isApproving ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Approving...
                        </>
                      ) : isSwapping ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Swapping...
                        </>
                      ) : (
                        `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedCrypto.symbol.toUpperCase()}`
                      )}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4">
                      Swaps are executed through the YieldShop Liquidity Pool
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

// Mini sparkline chart component
function MiniChart({ data, positive }: { data: number[]; positive: boolean }) {
  const points = data.slice(-24); // Last 24 hours
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;

  const pathData = points.map((value, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <path
        d={pathData}
        fill="none"
        stroke={positive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
