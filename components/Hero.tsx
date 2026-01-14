import { TrendingUp, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-transparent">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.01]"></div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/[0.02] rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-500/[0.02] rounded-full blur-[120px] animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 md:pt-40">

        {/* Main Heading with Enhanced Typography */}
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black mb-6 tracking-tighter animate-fade-in animate-fade-in-delay-1 leading-none">
          <span className="block text-white hover:scale-105 transition-transform duration-500 cursor-default drop-shadow-2xl">
            Yield
          </span>
          <span className="block -mt-4 lg:-mt-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 hover:scale-105 transition-transform duration-500 cursor-default animate-gradient-x drop-shadow-[0_0_40px_rgba(59,130,246,0.5)]">
            Shop
            <span className="text-blue-400">.</span>
          </span>
        </h1>

        {/* Enhanced Subheading */}
        <p className="mt-8 max-w-3xl mx-auto text-xl md:text-2xl text-zinc-300 font-normal tracking-wide leading-relaxed animate-fade-in animate-fade-in-delay-2">
          Transform every purchase into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-bold">yield-generating opportunity</span>.
          <br className="hidden md:block" />
          Shop smarter, earn crypto, and watch your cashback grow with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold">DeFi magic</span>.
        </p>

        {/* CTA Buttons with Enhanced Design */}
        <div className="mt-14 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animate-fade-in-delay-3">
          <Link href="/shop">
            <button className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl font-mono tracking-wide uppercase hover:from-blue-500 hover:to-blue-400 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 overflow-hidden transform hover:scale-105">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></span>
              <span className="relative flex items-center gap-3 z-10">
                <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                Start Shopping
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>

          <Link href="/trading">
            <button className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white border-2 border-zinc-700 hover:border-blue-500 rounded-2xl transition-all duration-300 font-mono tracking-wide uppercase hover:bg-zinc-900/50 backdrop-blur-sm shadow-lg hover:shadow-blue-500/20 transform hover:scale-105">
              <span className="relative flex items-center gap-3">
                <TrendingUp className="h-6 w-6 group-hover:scale-110 transition-transform" />
                Explore Markets
                <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </span>
            </button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500 animate-fade-in animate-fade-in-delay-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
            <span>Secured by Mantle Network</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
            <span>Non-Custodial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
            <span>Audited Smart Contracts</span>
          </div>
        </div>

      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
    </div>
  );
}
