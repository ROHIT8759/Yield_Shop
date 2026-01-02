'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { useAccount } from 'wagmi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function TradingPage() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-sol-bg pt-24 pb-16 px-4">
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
                            backgroundColor: '#1a1a2e',
                            border: '1px solid #8A2BE2',
                            borderRadius: '8px'
                          }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#8A2BE2"
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
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
                      Buy {selectedCrypto.symbol.toUpperCase()}
                    </button>
                    <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors">
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
                                setSelectedCrypto(crypto);
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
