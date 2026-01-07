import { TrendingUp, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-transparent">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-hero-glow opacity-40 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900/80 border border-blue-500/30 mb-8 animate-fade-in backdrop-blur-sm hover:border-blue-500/50 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs md:text-sm font-semibold text-blue-200 tracking-widest uppercase">Next Gen DeFi Shopping</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tighter animate-fade-in animate-fade-in-delay-1 leading-none">
          <span className="text-gradient block hover:scale-105 transition-transform duration-500 cursor-default">Yield</span>
          <span className="text-gradient-blue block -mt-2 lg:-mt-6 hover:scale-105 transition-transform duration-500 cursor-default text-glow">Shop.</span>
        </h1>

        {/* Subheading */}
        <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-light tracking-wide leading-relaxed animate-fade-in animate-fade-in-delay-2">
          Experience the future of commerce. Shop at your favorite stores, earn <span className="text-blue-400 font-semibold">Real World Assets</span>, and let your cashback grow with DeFi yields.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in animate-fade-in-delay-3">
          <Link href="/shop">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 rounded-full font-mono tracking-widest uppercase hover:bg-blue-500 btn-glow overflow-hidden">
              <span className="relative flex items-center gap-3 z-10">
                <ShoppingCart className="h-5 w-5" />
                Start Shopping
              </span>
            </button>
          </Link>

          <Link href="/trading">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded-full transition-all duration-200 font-mono tracking-widest uppercase hover:bg-zinc-900 hover:text-white">
              <span className="relative flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                View Markets
              </span>
            </button>
          </Link>
        </div>

      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-sol-bg to-transparent"></div>
    </div>
  );
}
