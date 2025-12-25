import { TrendingUp, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-sol-bg">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-hero-glow opacity-40 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sol-card border border-sol-primary/30 mb-8 animate-fade-in-up">
          <div className="w-2 h-2 rounded-full bg-sol-primary animate-pulse"></div>
          <span className="text-xs md:text-sm font-medium text-sol-text tracking-widest uppercase">Next Generation Trading</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white mb-6 tracking-tight">
          Invest<span className="text-sol-primary">.</span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-400 font-light tracking-wide leading-relaxed">
          Shop, trade, invest in Real World Assets, and earn DeFi rewards. Built on Mantle Network.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-sol-primary font-mono tracking-widest uppercase clip-path-polygon hover:bg-sol-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sol-primary">
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                [ START SHOPPING ]
              </span>
              <div className="absolute inset-0 -z-10 bg-sol-primary/50 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
            </button>
          </Link>

          <Link href="/trading">
            <button className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-sol-primary border-2 border-sol-primary transition-all duration-200 font-mono tracking-widest uppercase clip-path-polygon hover:bg-sol-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sol-primary">
              <span className="relative flex items-center gap-3">
                <TrendingUp className="h-5 w-5" />
                [ VIEW TRADING ]
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
