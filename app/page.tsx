'use client';

import { useState, useEffect } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import ParticlesBackground from '../components/ParticlesBackground';
import MouseEffect from '../components/MouseEffect';
import FAQ from '../components/FAQ';
import UserStats from '../components/UserStats';
import InteractiveStars from '../components/InteractiveStars';
import BackgroundMusic from '../components/BackgroundMusic';
import { getPoolBalance, getPoolStats } from '@/lib/supabase';

export default function Home() {
  const [poolData, setPoolData] = useState({
    totalBalance: 10000,
    availableBalance: 10000,
    totalOrders: 0,
    totalVolume: 0
  });

  useEffect(() => {
    loadPoolData();
  }, []);

  const loadPoolData = async () => {
    try {
      const balance = await getPoolBalance();
      const stats = await getPoolStats();

      setPoolData({
        totalBalance: balance.total_balance || 10000,
        availableBalance: balance.available_balance || 10000,
        totalOrders: stats.recentTransactions?.length || 0,
        totalVolume: stats.recentTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0
      });
    } catch (error) {
      console.error('Failed to load pool data:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Interactive Stars Background */}
      <InteractiveStars />

      {/* Mouse Cursor Effect */}
      <MouseEffect />

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-black"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      <LandingNavbar />
      <main>
        <Hero />

        {/* Live Platform Stats */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Live Platform Metrics
            </h2>
            <p className="text-zinc-400 text-lg">Real-time data from our liquidity pool and user activity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Liquidity */}
            <div className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/10 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Total Pool</span>
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                ${poolData.totalBalance.toLocaleString()}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Initial liquidity</p>
            </div>

            {/* Available Balance */}
            <div className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/10 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Available</span>
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                ${poolData.availableBalance.toLocaleString()}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Ready for orders</p>
            </div>

            {/* Orders Processed */}
            <div className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/10 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Orders</span>
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {poolData.totalOrders}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Successfully completed</p>
            </div>

            {/* Total Volume */}
            <div className="glass-card p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500/10 p-3 rounded-xl">
                  <svg className="h-6 w-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-400 font-semibold uppercase tracking-wider">Volume</span>
              </div>
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                ${poolData.totalVolume.toFixed(2)}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Total processed</p>
            </div>
          </div>
        </div>

        <UserStats />
        <Features />
        <FAQ />
      </main>
      <Footer />

      {/* Background Music Player */}
      <BackgroundMusic />
    </div>
  );
}
